import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmotionEnum } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class AffectiveInterventionTextService {
  constructor(private readonly prisma: PrismaService) {}

  async getAffectiveInterventionText() {
    const affectiveInterventionTextARCS =
      await this.prisma.affectiveInterventionTextARCS.findMany();

    return {
      success: true,
      message: 'Affective Intervention Text retrieved successfully',
      data: affectiveInterventionTextARCS,
    };
  }

  async getRandomAffectiveInterventionText(
    emotion: string,
    category: string,
    name: string,
    emotionValue: number,
    user,
    meetingCode?: string,
  ) {
    const userId = user.userId;

    const emotionMap = {
      sad: 1,
      angry: 2,
      fear: 3,
      disgust: 4,
      happy: 5,
      neutral: 6,
    };

    const positive = category === 'positive';
    const negative = category === 'negative';
    const emotionValueThreshold = 0.5;

    if (emotionValue < emotionValueThreshold) {
      throw new BadRequestException('Emotion value is below threshold (0.5) ');
    }
    const whereClause = {
      emotionId: emotionMap[emotion],
      positive,
      negative,
    };

    // Randomly select one ARCS category to focus on
    const arcsCategories = [
      'attention',
      'relevance',
      'confidence',
      'satisfaction',
    ];
    const randomCategory =
      arcsCategories[Math.floor(Math.random() * arcsCategories.length)];

    // Add the random ARCS category to where clause
    const finalWhereClause = {
      ...whereClause,
      [randomCategory]: true,
    };

    // Get total count of matching records
    const totalCount = await this.prisma.affectiveInterventionTextARCS.count({
      where: finalWhereClause,
    });

    if (totalCount === 0) {
      // If no records found with the specific ARCS category, try without it
      const result = await this.prisma.affectiveInterventionTextARCS.findFirst({
        where: whereClause,
        skip: Math.floor(Math.random() * (totalCount || 1)),
      });

      if (!result) {
        throw new NotFoundException(
          'No intervention text found for the given criteria',
        );
      }

      return this.processAndLogResult(
        result,
        emotion,
        category,
        emotionValue,
        userId,
        emotionMap,
        name,
        meetingCode,
      );
    }

    // Get a random record with the selected ARCS category
    const result = await this.prisma.affectiveInterventionTextARCS.findFirst({
      where: finalWhereClause,
      skip: Math.floor(Math.random() * totalCount),
    });

    return this.processAndLogResult(
      result,
      emotion,
      category,
      emotionValue,
      userId,
      emotionMap,
      name,
      meetingCode,
    );

  }

  
  private async processAndLogResult(
    result: any,
    emotion: string,
    category: string,
    emotionValue: number,
    userId: string,
    emotionMap: Record<string, number>,
    name: string,
    meetingCode?: string,
  ) {
    if (!result) {
      throw new NotFoundException('No intervention text found');
    }

    if (result.text) {
      result.text = result.text.replace(/\[nama\]/g, name);
    }

    // Log the text
    await this.prisma.affectiveTextLog.create({
      data: {
        textId: result.id,
        text: result.text,
        emotion: emotion.toUpperCase() as EmotionEnum,
        emotionId: emotionMap[emotion],
        category,
        userId,
        emotionValue: +emotionValue,
        meetingCode,
      },
    });

    return {
      ...result,
      arcsCategory: Object.entries(result)
        .filter(
          ([key, value]) =>
            ['attention', 'relevance', 'confidence', 'satisfaction'].includes(
              key,
            ) && value === true,
        )
        .map(([key]) => key),
    };
  }

  async getAggregatedAffectiveInterventionText() {
    return await this.prisma.affectiveTextLog.groupBy({
      by: ['emotion', 'category'],
      _count: {
        emotion: true,
      },
      _sum: {
        emotionId: true,
      },
      _avg: {
        emotionId: true,
      },
    });
  }

  async getAggregatedAffectiveInterventionTextByUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullname: true }, // Ambil id dan nama pengguna
    });

    // Ambil data yang dikelompokkan berdasarkan emosi dan teks
    const groupedData = await this.prisma.affectiveTextLog.groupBy({
      by: ['emotion'],
      where: {
        userId,
      },
      _max: {
        emotionValue: true,
      },
      _min: {
        emotionValue: true,
      },
      _avg: {
        emotionValue: true,
      },
      _count: {
        textId: true, // Menghitung jumlah kemunculan `textId` untuk tiap emosi
      },
    });

    // Ambil data teks yang paling sering muncul per emosi
    const textData = await this.prisma.affectiveTextLog.groupBy({
      by: ['emotion', 'textId', 'text'],
      where: {
        userId,
      },
      _count: {
        textId: true, // Hitung kemunculan `textId`
      },
    });

    // Siapkan format data yang diinginkan
    const emotionList = groupedData.map((emotionItem) => {
      const textsForEmotion = textData
        .filter((textItem) => textItem.emotion === emotionItem.emotion) // Filter teks berdasarkan emosi
        .map((textItem) => ({
          textId: textItem.textId,
          text: textItem.text,
          count: textItem._count.textId,
        }))
        .sort((a, b) => b.count - a.count); // Urutkan teks berdasarkan jumlah kemunculan

      return {
        emotion: emotionItem.emotion,
        statistics: {
          maxEmotionValue: emotionItem._max.emotionValue,
          minEmotionValue: emotionItem._min.emotionValue,
          avgEmotionValue: emotionItem._avg.emotionValue,
        },
        texts: textsForEmotion, 
      };
    });

    return {
      id: user?.id, 
      user: user?.fullname, 
      listOfDetectedEmotion: emotionList, 
    };
  }

  async getAggregatedAffectiveInterventionTextByUserARCS(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullname: true },
    });

    // Get emotional data with ARCS categories
    const textData = await this.prisma.affectiveTextLog.findMany({
      where: {
        userId,
      },
      select: {
        emotion: true,
        emotionValue: true,
        text: true,
        textId: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get ARCS data for each text
    const arcsData = await this.prisma.affectiveInterventionTextARCS.findMany({
      where: {
        id: {
          in: textData.map((t) => t.textId),
        },
      },
      select: {
        id: true,
        text: true,
        attention: true,
        relevance: true,
        confidence: true,
        satisfaction: true,
        emotion: {
          select: {
            emotion: true,
          },
        },
      },
    });

    // Helper function to calculate statistics
    const calculateStats = (values: number[]) => {
      const filteredValues = values.filter(
        (v) => v !== null && v !== undefined,
      );
      return {
        max: Math.max(...filteredValues),
        min: Math.min(...filteredValues),
        avg: filteredValues.reduce((a, b) => a + b, 0) / filteredValues.length,
        count: filteredValues.length,
      };
    };

    // Group texts by ARCS categories
    const arcsCategories = {
      attention: [],
      relevance: [],
      confidence: [],
      satisfaction: [],
    };

    arcsData.forEach((arcsText) => {
      const textsWithThisId = textData.filter((t) => t.textId === arcsText.id);
      const emotionValues = textsWithThisId.map((t) => t.emotionValue);
      const stats = calculateStats(emotionValues);

      const textEntry = {
        textId: arcsText.id,
        text: arcsText.text,
        emotion: arcsText.emotion.emotion,
        statistics: {
          maxEmotionValue: stats.max,
          minEmotionValue: stats.min,
          avgEmotionValue: stats.avg,
          useCount: stats.count,
        },
      };

      if (arcsText.attention) arcsCategories.attention.push(textEntry);
      if (arcsText.relevance) arcsCategories.relevance.push(textEntry);
      if (arcsText.confidence) arcsCategories.confidence.push(textEntry);
      if (arcsText.satisfaction) arcsCategories.satisfaction.push(textEntry);
    });

    return {
      id: user?.id,
      user: user?.fullname,
      arcsCategories: {
        attention: {
          texts: arcsCategories.attention.sort(
            (a, b) => b.statistics.useCount - a.statistics.useCount,
          ),
          totalTexts: arcsCategories.attention.length,
        },
        relevance: {
          texts: arcsCategories.relevance.sort(
            (a, b) => b.statistics.useCount - a.statistics.useCount,
          ),
          totalTexts: arcsCategories.relevance.length,
        },
        confidence: {
          texts: arcsCategories.confidence.sort(
            (a, b) => b.statistics.useCount - a.statistics.useCount,
          ),
          totalTexts: arcsCategories.confidence.length,
        },
        satisfaction: {
          texts: arcsCategories.satisfaction.sort(
            (a, b) => b.statistics.useCount - a.statistics.useCount,
          ),
          totalTexts: arcsCategories.satisfaction.length,
        },
      },
    };
  }
}
