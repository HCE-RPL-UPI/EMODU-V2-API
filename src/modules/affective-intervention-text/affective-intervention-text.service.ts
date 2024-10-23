import { Injectable } from '@nestjs/common';
import { EmotionEnum } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class AffectiveInterventionTextService {
  constructor(private readonly prisma: PrismaService) {}

  async getAffectiveInterventionText() {
    return await this.prisma.affectiveInterventionTextARCS.findMany();
  }

  async getRandomAffectiveInterventionText(
    filter: string,
    category: string,
    name: string,
    emotionValue: number,
    user
  ) {
    const userId = user.userId;

    const emotionMap = {
      sad: 1,
      angry: 2,
      fear: 3,
      disgust: 4,
    };
  
    const positive = category === 'positive';
  
    let whereClause = {};
  
    if (filter in emotionMap) {
      whereClause = {
        emotionId: emotionMap[filter],
        positive,
      };
    }
  
    const result = await this.prisma.affectiveInterventionTextARCS.findFirst({
      where: whereClause,
      skip: Math.floor(Math.random() * 10),
    });
  
    if (result && result.text) {
      result.text = result.text.replace(/\[nama\]/g, name);
    }


    await this.prisma.affectiveTextLog.create({
      data: {
        textId: result.id,
        text: result.text,
        emotion : filter.toUpperCase() as EmotionEnum, 
        emotionId: emotionMap[filter],
        category,        
        userId,
        emotionValue: +emotionValue,
      },
    });
  
    return result;
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
        texts: textsForEmotion, // Tambahkan teks yang paling sering muncul
      };
    });
  
    return {
      id: user?.id, // id pengguna
      user: user?.fullname, // nama pengguna
      listOfDetectedEmotion: emotionList, // daftar emosi yang terdeteksi
    };
  }
}
