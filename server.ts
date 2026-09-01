import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini API
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Endpoint: Generate 10 Customer Insights & Viral Hooks
app.post('/api/insights/generate', async (req, res) => {
  try {
    const { productName, productInfo, category, existingInsights = [] } = req.body;

    if (!productName || !productName.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên sản phẩm' });
    }

    const ai = getAIClient();

    const existingContext = existingInsights.length > 0
      ? `\nCác insight đã có trước đó (hãy tạo 10 insight MỚI HOÀN TOÀN, không trùng lặp các góc tiếp cận sau):\n` +
        existingInsights.slice(-10).map((ins: any, idx: number) => `${idx + 1}. [${ins.angle}] Hook: ${ins.viralHook}`).join('\n')
      : '';

    const prompt = `Bạn là một chuyên gia nghiên cứu tâm lý khách hàng (Customer Insight Expert) và biên kịch video ngắn triệu view (TikTok/Reels/Shorts) chuyên sâu ngành hàng "Mẹ và Bé" (Mother & Baby) tại Việt Nam.

Nhiệm vụ: Phân tích sâu sắc sản phẩm sau đây để tạo ra ĐÚNG 10 INSIGHT KHÁCH HÀNG KÈM CÂU VIRAL HOOK MỞ ĐẦU VIDEO.

--- THÔNG TIN SẢN PHẨM ---
- Tên sản phẩm: ${productName}
- Hạng mục: ${category || 'Mẹ và Bé'}
- Thông tin / Công dụng / Đặc điểm:
${productInfo || 'Sản phẩm phục vụ cho mẹ và bé'}
${existingContext}

--- YÊU CẦU ĐẦU RA CHO 10 INSIGHT ---
Mỗi insight cần:
1. "angle": Tên góc tiếp cận ngắn gọn, súc tích (VD: "Nỗi đau chăm con đêm", "Tâm lý sợ con hăm/kích ứng", "Giải phóng thời gian mẹ bỉm", "Sai lầm kinh điển của mẹ mới sinh", "Bí quyết mẹ nhàn con khỏe", "Tâm lý lo lắng chất lượng an toàn", "Bé biếng ăn/khó chiều", "Trải nghiệm thực tế sau 1 tháng", "Cảnh báo mẹ đừng làm theo cách cũ", "Tâm lý xót tiền nhưng đáng từng đồng").
2. "painPoint": Phân tích sâu sắc tâm lý, nỗi sợ thầm kín, cảm giác bất lực, stress hoặc trăn trở lớn nhất của mẹ bỉm / phụ huynh liên quan đến sản phẩm này.
3. "benefit": Sự giải thoát, cảm giác nhẹ nhõm, tiện ích vượt bậc hoặc giá trị cảm xúc & an toàn mà sản phẩm mang lại cho mẹ & bé.
4. "viralHook": Câu mở đầu video 3-5 giây đầu (Hook) cực kỳ bắt tai, đánh trúng tâm lý, kích thích tò mò hoặc khơi dậy cảm xúc mạnh mẽ, giúp giữ chân người xem ngay lập tức trên TikTok/Reels/Shorts (Viết bằng tiếng Việt tự nhiên, gần gũi, chuẩn giọng mẹ bỉm hiện đại).
5. "scriptIdea": Ý tưởng kịch bản triển khai tiếp theo trong 15-30 giây (mô tả ngắn gọn hướng đi của video).

Hãy trả về định dạng JSON gồm mảng đúng 10 phần tử.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Bạn là chuyên gia phân tích tâm lý khách hàng và biên kịch viral video hàng đầu Việt Nam cho các nhãn hàng Mẹ & Bé.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              angle: { type: Type.STRING, description: 'Tên góc tiếp cận tâm lý' },
              painPoint: { type: Type.STRING, description: 'Nỗi đau / tâm lý sâu kín của khách hàng' },
              benefit: { type: Type.STRING, description: 'Lợi ích / giải pháp thực tế' },
              viralHook: { type: Type.STRING, description: 'Câu viral hook 3-5 giây mở đầu video' },
              scriptIdea: { type: Type.STRING, description: 'Gợi ý ý tưởng kịch bản triển khai ngắn' },
            },
            required: ['angle', 'painPoint', 'benefit', 'viralHook', 'scriptIdea'],
          },
        },
      },
    });

    const responseText = response.text || '[]';
    let insightsData = [];
    try {
      insightsData = JSON.parse(responseText.trim());
    } catch (e) {
      console.error('Failed to parse AI JSON:', responseText);
      insightsData = [];
    }

    // Format items with unique ids and timestamps
    const formattedInsights = insightsData.map((item: any, index: number) => ({
      id: `ins_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
      angle: item.angle || `Góc nhìn tâm lý #${index + 1}`,
      painPoint: item.painPoint || '',
      benefit: item.benefit || '',
      viralHook: item.viralHook || '',
      scriptIdea: item.scriptIdea || '',
      isFavorite: false,
      createdAt: new Date().toISOString(),
    }));

    return res.json({ insights: formattedInsights });
  } catch (error: any) {
    console.error('Error generating insights:', error);
    return res.status(500).json({
      error: 'Không thể tạo insight lúc này: ' + (error?.message || 'Lỗi xử lý AI'),
    });
  }
});

// Endpoint: Suggest 6-8 Creative B-roll / Video Shots
app.post('/api/shots/suggest', async (req, res) => {
  try {
    const { productName, productInfo, category, selectedInsight } = req.body;

    if (!productName || !productName.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên sản phẩm' });
    }

    const ai = getAIClient();

    const prompt = `Bạn là đạo diễn hình ảnh / Content Creator chuyên quay dựng video review sản phẩm Mẹ & Bé triệu view trên TikTok & Shopee Video.

Hãy đề xuất 6-8 CẢNH QUAY ĐẸP, HẤP DẪN (Shot list / B-roll) để làm tư liệu dựng video cho sản phẩm:
- Tên sản phẩm: ${productName}
- Hạng mục: ${category || 'Mẹ và Bé'}
- Thông tin sản phẩm: ${productInfo || ''}
${selectedInsight ? `- Trọng tâm insight/hook đang dùng: "${selectedInsight.viralHook}" (Góc: ${selectedInsight.angle})` : ''}

Mỗi cảnh quay cần trực quan, dễ thực hiện tại nhà với điện thoại, làm nổi bật chất lượng sản phẩm, độ an toàn và cảm xúc chân thực của mẹ và bé.

Hãy trả về JSON gồm mảng các cảnh quay.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Tên ngắn gọn của cảnh quay' },
              description: { type: Type.STRING, description: 'Mô tả chi tiết hành động và bố cục trong khung hình' },
              shotType: { type: Type.STRING, description: 'Góc quay (Cận cảnh Close-up, Toàn cảnh Wide, POV, Góc nghiêng 45 độ, Flatlay...)' },
              durationSeconds: { type: Type.NUMBER, description: 'Thời lượng dự kiến (từ 2 đến 6 giây)' },
              onScreenText: { type: Type.STRING, description: 'Chữ chèn nổi bật trên video (Text overlay)' },
              propOrNote: { type: Type.STRING, description: 'Đạo cụ cần chuẩn bị hoặc lưu ý ánh sáng/âm thanh' },
            },
            required: ['title', 'description', 'shotType', 'durationSeconds', 'onScreenText'],
          },
        },
      },
    });

    const responseText = response.text || '[]';
    let shotsData = [];
    try {
      shotsData = JSON.parse(responseText.trim());
    } catch (e) {
      console.error('Failed to parse AI shots JSON:', responseText);
      shotsData = [];
    }

    const formattedShots = shotsData.map((item: any, index: number) => ({
      id: `shot_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
      title: item.title || `Cảnh quay #${index + 1}`,
      description: item.description || '',
      shotType: item.shotType || 'Cận cảnh (Close-up)',
      durationSeconds: item.durationSeconds || 3,
      onScreenText: item.onScreenText || '',
      propOrNote: item.propOrNote || '',
      status: 'pending', // 'pending' | 'filmed'
      createdAt: new Date().toISOString(),
    }));

    return res.json({ shots: formattedShots });
  } catch (error: any) {
    console.error('Error suggesting shots:', error);
    return res.status(500).json({
      error: 'Không thể tạo gợi ý cảnh quay: ' + (error?.message || 'Lỗi xử lý AI'),
    });
  }
});

// Vite middleware for dev / static for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
