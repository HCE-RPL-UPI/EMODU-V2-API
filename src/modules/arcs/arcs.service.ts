import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
@Injectable()
export class ArcsService {
  constructor(private readonly configService: ConfigService) {}
  private readonly serviceAccountKeyFile =
    './project-emosync-5cc7841a1889.json';
  // private readonly spreadsheetId = process.env.GOOGLE_SHEET_ID
  // private readonly sheetId = this.configService.get<string>('GOOGLE_SHEETS_ID');
  private readonly sheetId = process.env.GOOGLE_SHEETS_ID;
  private readonly tabName = 'Form Responses 1';
  // yg nika
  private readonly range = 'B:AH';

  // yg syifa
  // const range = 'A:AI';
  private async getGoogleSheetClient() {
    const auth = new google.auth.GoogleAuth({
      keyFile: this.serviceAccountKeyFile,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();
    // return google.sheets({ version: 'v4', auth: authClient });
    return google.sheets({ version: 'v4', auth: authClient as any });
  }

  private async readGoogleSheet(googleSheetClient, sheetId, tabName, range) {
    const res = await googleSheetClient.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${tabName}!${range}`,
    });
    return res.data.values;
  }

  async sheetsServiceInit() {
    const googleSheetClient = await this.getGoogleSheetClient();

    const data = await this.readGoogleSheet(
      googleSheetClient,
      this.sheetId,
      this.tabName,
      this.range
    );

    // console.log(data);

    const categories = [
      { key: 'attentionPositive', start: 0, end: 4 },
      { key: 'attentionNegative', start: 4, end: 8 },
      { key: 'relevancePositive', start: 8, end: 12 },
      { key: 'relevanceNegative', start: 12, end: 16 },
      { key: 'confidencePositive', start: 16, end: 20 },
      { key: 'confidenceNegative', start: 20, end: 24 },
      { key: 'satisfactionPositive', start: 24, end: 28 },
      { key: 'satisfactionNegative', start: 28, end: 32 },
    ];

    const mapScoreARCS = {};

    // for (const category of categories) {
    //   const categoryData = data.slice(1).map((item) => {
    //     const categoryPositionData = item.slice(category.start, category.end);
    //     const email = item[1]; // Mengambil email dari kolom kedua
    //     return {
    //       email,
    //       data: categoryPositionData,
    //       score: categoryPositionData.reduce(
    //         (acc, curr) => acc + parseInt(curr),
    //         0,
    //       ),
    //     };
    //   });
    //   mapScoreARCS[category.key] = categoryData;
    // }
    for (const category of categories) {
      const categoryData = data.slice(1).map((item) => {
        const categoryPositionData = item.slice(category.start, category.end);

        // yg nika
        const getOnlyEmail = item[32]; // Fetch email from the current row

        // yg syifa
        // const getOnlyEmail = item[1]; // Fetch email from the current row

        return {
          email: getOnlyEmail,
          data: categoryPositionData,
          score: categoryPositionData.reduce(
            (acc, curr) => acc + parseInt(curr),
            0,
          ),
        };
      });

      mapScoreARCS[category.key] = categoryData;
    }

    return mapScoreARCS;
  }

  async getScoresByEmail(email: string) {
    const googleSheetClient = await this.getGoogleSheetClient();
    const data = await this.readGoogleSheet(
      googleSheetClient,
      this.sheetId,
      this.tabName,
      this.range,
    );

    // yg nika
    const categories = [
      { key: 'attentionPositive', start: 0, end: 4 },
      { key: 'attentionNegative', start: 4, end: 8 },
      { key: 'relevancePositive', start: 8, end: 12 },
      { key: 'relevanceNegative', start: 12, end: 16 },
      { key: 'confidencePositive', start: 16, end: 20 },
      { key: 'confidenceNegative', start: 20, end: 24 },
      { key: 'satisfactionPositive', start: 24, end: 28 },
      { key: 'satisfactionNegative', start: 28, end: 32 },
    ];

    // yg syifa
    // const categories = [
    //   {key: 'attentionPositive', start: 3, end: 7},
    //   {key: 'attentionNegative', start: 7, end: 11},
    //   {key: 'relevancePositive', start: 11, end: 15},
    //   {key: 'relevanceNegative', start: 15, end: 19},
    //   {key: 'confidencePositive', start: 19, end: 23},
    //   {key: 'confidenceNegative', start: 23, end: 27},
    //   {key: 'satisfactionPositive', start: 27, end: 31},
    //   {key: 'satisfactionNegative', start: 31, end: 35}
    // ];
    const scoresByEmail = {};

    // for (const category of categories) {
    //   const categoryData = data
    //     .slice(1)
    //     .map((item) => {
    //       const categoryPositionData = item.slice(category.start, category.end);
    //       const itemEmail = item[1];

    //       if (itemEmail === email) {
    //         return {
    //           data: categoryPositionData,
    //           score: categoryPositionData.reduce(
    //             (acc, curr) => acc + parseInt(curr),
    //             0,
    //           ),
    //         };
    //       }
    //     })
    //     .filter(Boolean);

    //   scoresByEmail[category.key] = categoryData;
    // }

    // return scoresByEmail;
    for (const category of categories) {
      const categoryData = data
        .slice(1)
        .map((item) => {
          // console.log(item[3])
          // console.log(item)
          const categoryPositionData = item.slice(category.start, category.end);

          // yg nika
          const itemEmail = item[32]; // Fetch email from the current row

          // yg syifa
          // const itemEmail = item[1]; // Fetch email from the current row

          if (itemEmail === email) {
            return {
              data: categoryPositionData,
              score: categoryPositionData.reduce(
                (acc, curr) => acc + parseInt(curr),
                0,
              ),
            };
          }
        })
        .filter(Boolean);

      scoresByEmail[category.key] = categoryData;
    }

    return scoresByEmail;
  }
  async getScoreByEmailFormatted(email: string) {
    const scores = await this.getScoresByEmail(email);


    if (!scores['attentionPositive'].length) {
      // throw new NotFoundException('Email not found');

      return {
        email,
        attentionPositiveScore: 10,
        attentionNegativeScore: 0,
        relevancePositiveScore: 10,
        relevanceNegativeScore: 0,
        confidencePositiveScore: 10,
        confidenceNegativeScore: 0,
        satisfactionPositiveScore: 10,
        satisfactionNegativeScore: 10,
        totalPositiveScore: 50,
        totalNegativeScore: 0,
        result: 'positive',
      };

    }
    // if(scores)
    if (!scores) {
      throw new NotFoundException('Email not found');
    }
    // console.log('scores', scores);
    let totalPositiveScore = 0;
    let totalNegativeScore = 0;

    for (const category in scores) {
      if (category.includes('Positive')) {
        totalPositiveScore += scores[category][0].score;
      } else if (category.includes('Negative')) {
        totalNegativeScore += scores[category][0].score;
      }
    }

    // if(!scores['attentionPositive'] || !scores['attentionNegative'] ) { 
    //   // throw new NotFoundException('Data not found');
    // }

    const result =
      totalPositiveScore >= totalNegativeScore ? 'positive' : 'negative';

    // console.log('result', result);
    if(!result || !scores['attentionPositive'] || !scores['attentionNegative'] || !scores['relevancePositive'] || !scores['relevanceNegative'] || !scores['confidencePositive'] || !scores['confidenceNegative'] || !scores['satisfactionPositive'] || !scores['satisfactionNegative']) {
      throw new NotFoundException('Data not found');
    }

    return {
      email,
      attentionPositiveScore: scores['attentionPositive'][0].score,
      attentionNegativeScore: scores['attentionNegative'][0].score,
      relevancePositiveScore: scores['relevancePositive'][0].score,
      relevanceNegativeScore: scores['relevanceNegative'][0].score,
      confidencePositiveScore: scores['confidencePositive'][0].score,
      confidenceNegativeScore: scores['confidenceNegative'][0].score,
      satisfactionPositiveScore: scores['satisfactionPositive'][0].score,
      satisfactionNegativeScore: scores['satisfactionNegative'][0].score,
      totalPositiveScore,
      totalNegativeScore,
      result,
    };
  }
}
