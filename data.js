/**
 * 115學年度高中英文課務協作平台 - 核心資料庫 (data.js)
 * 最新修訂：英文科負責人 何妃卿 老師、代理負責人 陳文宗 老師；並依 115(1)行事曆_0724.pdf 校對所有日期。
 */

// 全校英文科教師陣容與帳號資料
const INITIAL_TEACHERS = [
  { id: 'ho_fei_ching', name: '何妃卿 老師', username: 'ho', password: '11502', role: 'admin', avatar: '👑', desc: '115學年度 英文科負責人 / 召集人', subjects: ['英一B', '普一2輔導課', '普二1英文', '普三3英作', '七年級彈性'] },
  { id: 'chen_wen_tzong', name: '陳文宗 老師', username: 'chen', password: '11504', role: 'teacher', avatar: '👨‍🏫', desc: '115學年度 英文科代理負責人 / 專任教師', subjects: ['普一英聽', '普二2英文', '餐一1', '餐一4', '幼一1', '電資一2', '計三1', '計三2'] },
  { id: 'lin_tian_yi', name: '林天宜 老師', username: 'lin', password: '11501', role: 'teacher', avatar: '👩‍🏫', desc: '普一英文組導師', subjects: ['英一A', '普一1輔導課', '九年級彈性', '計二1', '計二2', '日三1', '餐三4'] },
  { id: 'tsai_hsin_yu', name: '蔡欣妤 老師', username: 'tsai', password: '11503', role: 'teacher', avatar: '👩‍🏫', desc: '高中部英文專任教師', subjects: ['英一C', '英三B', '普三2英作', '八年2班英文', '日二1', '餐二1', '電二1'] },
  { id: 'yen_hui_ling', name: '顏惠玲 老師', username: 'yen', password: '11505', role: 'teacher', avatar: '👩‍🏫', desc: '高三英文組資深教師', subjects: ['英三C', '普三1英作', '八年1班英文', '商三1', '餐三3', '幼三1'] },
  { id: 'huang_lan_ting', name: '黃蘭婷 老師', username: 'huang', password: '11509', role: 'teacher', avatar: '👩‍🏫', desc: '國中部 / 技高英文專任教師', subjects: ['九年1班', '九年2班', '餐一2', '商二1', '餐二4', '電三1'] },
  { id: 'chen_wei_tzu', name: '陳慰慈 老師', username: 'chen_wt', password: '11510', role: 'teacher', avatar: '👩‍🏫', desc: '國中部英文專任教師', subjects: ['七年1班', '七年2班', '餐二2', '餐三2', '計一1', '計一2'] },
  { id: 'hsiung_min_hui', name: '熊敏慧 老師', username: 'hsiung', password: '11508', role: 'teacher', avatar: '👩‍🏫', desc: '技高英文專任教師', subjects: ['餐一3', '電資一1', '餐二3', '資二1', '幼二1', '餐三1', '資三1'] },
  { id: 'hsiao_yung_lin', name: '蕭永琳 老師', username: 'hsiao', password: '11506', role: 'teacher', avatar: '👩‍🏫', desc: '英文專任教師', subjects: ['高中段考輔助', '英語文競賽指導'] }
];

// 115學年度最新任課與授課節數統計 (源自 115學年度第1學期_英文科教師授課節數統計表_v4.xlsx)
const COURSE_ASSIGNMENTS = {
  academicYear: '115學年度',
  inCharge: {
    head: '何妃卿 老師 (英文科負責人)',
    deputy: '陳文宗 老師 (代理負責人)',
    duties: [
      '1. 主持英文科務會議、擬定 115 學年度教學進度與段考日程表。',
      '2. 自動依據任課班級平均分配各年級段考與英聽出題教師。',
      '3. 掌管 115 學年度書卷雜誌訂購數量、試卷配發及教學 MEMO 事項。'
    ]
  },
  grades: [
    {
      grade: '普高一年級',
      sections: [
        { subject: '普一英文正課與輔導', items: [
          { name: '英一A (4節正課 + 2節輔導)', teacher: '林天宜 老師' },
          { name: '英一B (4節正課 + 2節輔導)', teacher: '何妃卿 老師' },
          { name: '英一C (4節正課)', teacher: '蔡欣妤 老師' }
        ]},
        { subject: '普一英語聽講', items: [{ name: '英聽全班 (2節)', teacher: '陳文宗 老師' }] }
      ]
    },
    {
      grade: '普高二年級',
      sections: [
        { subject: '普二英文正課與輔導', items: [
          { name: '普二1 (4節正課 + 1節輔導)', teacher: '何妃卿 老師' },
          { name: '普二2 (4節正課 + 1節輔導)', teacher: '陳文宗 老師' }
        ]}
      ]
    },
    {
      grade: '普高三年級',
      sections: [
        { subject: '普三英文正課、輔導與英作', items: [
          { name: '普三1 (2節正課 + 1節輔導 + 2節英作)', teacher: '顏惠玲 老師' },
          { name: '普三2 (2節正課 + 1節輔導 + 2節英作)', teacher: '蔡欣妤 老師' },
          { name: '普三3 (2節正課 + 1節輔導 + 2節英作)', teacher: '何妃卿 老師' }
        ]}
      ]
    },
    {
      grade: '國中部',
      sections: [
        { subject: '七年級', items: [
          { name: '七年1班 (3正+1輔/陳慰慈)', teacher: '陳慰慈 老師 (彈性: 何妃卿)' },
          { name: '七年2班 (3正+1輔/陳慰慈)', teacher: '陳慰慈 老師 (彈性: 何妃卿)' }
        ]},
        { subject: '八年級', items: [
          { name: '八年1班 (3正+1輔/顏惠玲)', teacher: '顏惠玲 老師 (彈性: 蔡欣妤)' },
          { name: '八年2班 (3正+1輔/蔡欣妤)', teacher: '蔡欣妤 老師 (彈性: 顏惠玲)' }
        ]},
        { subject: '九年級', items: [
          { name: '九年1班 (3正+1輔/黃蘭婷)', teacher: '黃蘭婷 老師 (彈性: 林天宜)' },
          { name: '九年2班 (3正+1輔/黃蘭婷)', teacher: '黃蘭婷 老師 (彈性: 林天宜)' }
        ]}
      ]
    },
    {
      grade: '技高 / 職業類科',
      sections: [
        { subject: '一年級類科', items: [
          { name: '商一1', teacher: '何妃卿 老師' }, { name: '日一1', teacher: '何妃卿 老師' },
          { name: '餐一1 / 餐一4', teacher: '陳文宗 老師' }, { name: '餐一2', teacher: '黃蘭婷 老師' },
          { name: '餐一3 / 電資一1', teacher: '熊敏慧 老師' }, { name: '幼一1 / 電資一2', teacher: '陳文宗 老師' },
          { name: '計一1 / 計一2', teacher: '陳慰慈 老師' }
        ]},
        { subject: '二年級類科', items: [
          { name: '商二1 / 餐二4', teacher: '黃蘭婷 老師' }, { name: '日二1 / 餐二1 / 電二1', teacher: '蔡欣妤 老師' },
          { name: '餐二2', teacher: '陳慰慈 老師' }, { name: '餐二3 / 幼二1 / 資二1', teacher: '熊敏慧 老師' },
          { name: '計二1 / 計二2', teacher: '林天宜 老師' }
        ]},
        { subject: '三年級類科', items: [
          { name: '商三1 / 餐三3 / 幼三1', teacher: '顏惠玲 老師' }, { name: '日三1 / 餐三4', teacher: '林天宜 老師' },
          { name: '餐三1 / 資三1', teacher: '熊敏慧 老師' }, { name: '餐三2', teacher: '陳慰慈 老師' },
          { name: '電三1', teacher: '黃蘭婷 老師' }, { name: '計三1 / 計三2', teacher: '陳文宗 老師' }
        ]}
      ]
    }
  ]
};

// 精準校對 115(1)行事曆_0724.pdf 之完整時間線日程
const TIMELINE_DATA = [
  {
    semester: '115學年度 第一學期 (115-1 正式行事曆)',
    months: [
      {
        month: '八月 (115年)',
        events: [
          { date: '8/25 (一)', type: 'start', title: '期初教學研究會、第1次領域會議、行政會報', desc: '發放教科書與雜誌、登記訂購數量與確立評量尺規標準。', inCharge: '何妃卿 (科負責人) / 陳文宗 (代理)' },
          { date: '8/26 (二)', type: 'activity', title: '新生始業輔導', desc: '高一新生性適應與始業輔導活動。', inCharge: '全體導師' },
          { date: '8/29 (五)', type: 'start', title: '開學典禮與正式上課日', desc: '全校正式開學上課，進行友善校園週宣導。', inCharge: '全校教職員' }
        ]
      },
      {
        month: '九月 (115年)',
        events: [
          { date: '9/8 (一)', type: 'course', title: '全高中部與國中部第八節輔導課正式開始', desc: '第 8 節課輔正式啟動，任課老師進行隨堂講義教學。', inCharge: '全體任課老師' },
          { date: '9/16 (二) - 9/17 (三)', type: 'exam_prep', title: '國九 / 普三 第 1 次學測/會考模擬考', desc: '高三與國九第 1 次全校性模擬考驗收。', inCharge: '高三國九任課老師' },
          { date: '9/17 (三)', type: 'activity', title: '高中部社團活動 / 全校防震演練', desc: '進行社團課程與防震防災逃生演練。', inCharge: '全校' },
          { date: '9/24 (三)', type: 'activity', title: '高中部與國中部社團活動', desc: '社團課正式上課。', inCharge: '社團指導老師' }
        ]
      },
      {
        month: '十月 (115年)',
        events: [
          { date: '10/6 (一) - 10/8 (三)', type: 'exam', title: '🚨 第一次段考（第1次段考筆試測驗）', desc: '連續三天進行第 1 次段考筆試，請各出題老師預先完成審題。', inCharge: '自動分配出題老師 (林天宜/何妃卿/顏惠玲/陳文宗)' },
          { date: '10/8 (三)', type: 'course', title: '第 2 次領域會議與國中評量研討', desc: '段考最後一日下午進行領域研討會。', inCharge: '何妃卿、陳文宗' },
          { date: '10/10 (五)', type: 'holiday', title: '國慶日連假放假', desc: '國慶日放假一天。', inCharge: '全校' },
          { date: '10/25 (六)', type: 'holiday', title: '台灣光復節 (10/26 補假)', desc: '紀念日補假。', inCharge: '全校' },
          { date: '10/29 (三)', type: 'exam_prep', title: '普三 第 2 次模擬考', desc: '高三考大考模擬卷。', inCharge: '高三老師' }
        ]
      },
      {
        month: '十一月 (115年)',
        events: [
          { date: '11/12 (三)', type: 'activity', title: '校慶大隊接力預演與社團', desc: '校慶前大隊接力預演。', inCharge: '全校' },
          { date: '11/15 (六)', type: 'activity', title: '🏆 屏榮高中校慶園遊會 (11/17 補假)', desc: '全校校慶活動，週一 11/17 補假放假一天。', inCharge: '全校教職員' },
          { date: '11/26 (三) - 11/28 (五)', type: 'exam', title: '🚨 第二次段考（第2次段考筆試測驗）', desc: '連續三天進行第 2 次段考筆試。', inCharge: '自動分配出題老師 (何妃卿/陳文宗/蔡欣妤)' }
        ]
      },
      {
        month: '十二月 (115年)',
        events: [
          { date: '12/10 (三) - 12/12 (五)', type: 'activity', title: '高二公訓露營活動', desc: '高二年級戶外公民訓練與露營。', inCharge: '高二導師' },
          { date: '12/17 (三)', type: 'exam_prep', title: '職科 第 2 次模擬考 / 聖誕快閃', desc: '技高模擬考與聖誕節社團活動。', inCharge: '任課老師' },
          { date: '12/25 (四)', type: 'activity', title: '行憲紀念日 / 多媒體畢業專題展', desc: '畢業專題成果展覽。', inCharge: '全體師生' },
          { date: '12/31 (三)', type: 'activity', title: '高一炊事比賽 / 高二創意化裝舞台劇', desc: '歲末全校歡慶活動。', inCharge: '高一高二導師' }
        ]
      },
      {
        month: '一月 (116年)',
        events: [
          { date: '1/1 (四)', type: 'holiday', title: '元旦連假放假', desc: '元旦放假一天。', inCharge: '全校' },
          { date: '1/14 (三)', type: 'course', title: '第八節輔導課最後一日上課', desc: '本學期輔導課結束。', inCharge: '全體老師' },
          { date: '1/15 (四) - 1/16 (五)', type: 'exam', title: '🚨 第三次段考 / 期末考測驗', desc: '本學期最終段考筆試測驗，成績需於期限內登錄。', inCharge: '全體英文科老師' },
          { date: '1/17 (六) - 1/19 (一)', type: 'exam', title: '🎓 115學年度 大學學科能力測驗 (學測)', desc: '高三學測全國統考。', inCharge: '高三師生' },
          { date: '1/19 (一)', type: 'start', title: '期末暨期初校務會議 / 期末教學研究會', desc: '結算學期成績與備課檢討。', inCharge: '何妃卿 (科負責人) / 陳文宗 (代理)' },
          { date: '1/20 (二)', type: 'holiday', title: '寒假正式開始', desc: '學生開始寒假，後續進行寒假補考與重補修作業。', inCharge: '陳文宗 老師 (代理)' }
        ]
      }
    ]
  }
];

// 自動依任課班級平均分配段考出題表 (Auto-balanced by Teaching Class)
const INITIAL_EXAM_SETTERS = [
  { id: 'es_1', grade: '普高一年級', subject: '英文', exam1: '林天宜 老師', scope1: '', exam2: '何妃卿 老師', scope2: '', finalExam: '蔡欣妤 老師', finalScope: '' },
  { id: 'es_2', grade: '普高一年級', subject: '英聽', exam1: '陳文宗 老師', scope1: '', exam2: '陳文宗 老師', scope2: '', finalExam: '陳文宗 老師', finalScope: '' },
  { id: 'es_3', grade: '普高二年級', subject: '英文', exam1: '何妃卿 老師', scope1: '', exam2: '陳文宗 老師', scope2: '', finalExam: '何妃卿 老師', finalScope: '' },
  { id: 'es_4', grade: '普高二年級', subject: '英閱寫作', exam1: '何妃卿 老師', scope1: '', exam2: '何妃卿 老師', scope2: '', finalExam: '何妃卿 老師', finalScope: '' },
  { id: 'es_5', grade: '普高三年級', subject: '英文', exam1: '顏惠玲 老師', scope1: '', exam2: '蔡欣妤 老師', scope2: '', finalExam: '何妃卿 老師', finalScope: '' },
  { id: 'es_6', grade: '普高三年級', subject: '英作', exam1: '蔡欣妤 老師', scope1: '', exam2: '何妃卿 老師', scope2: '', finalExam: '顏惠玲 老師', finalScope: '' }
];

// 段考題型與範圍 (預設留空白供出題老師線上更新)
const INITIAL_EXAM_SPECS = [
  {
    id: 'spec_g1',
    grade: '普高一年級',
    subject: '英文',
    examTitle: '普一 第1次段考 (10/6-10/8)',
    setter: '林天宜 老師',
    scope: '', // 空白，等出題老師線上填寫
    formatNotes: '請出題老師於考前線上補齊選擇題與非選擇題配分比例及說明。'
  },
  {
    id: 'spec_g2',
    grade: '普高二年級',
    subject: '英文',
    examTitle: '普二 第1次段考 (10/6-10/8)',
    setter: '何妃卿 老師',
    scope: '', // 空白，等出題老師線上填寫
    formatNotes: '包含選擇題與手寫題（單字、句型與翻譯）。'
  },
  {
    id: 'spec_g3',
    grade: '普高三年級',
    subject: '英文作文',
    examTitle: '普三 第1次段考 (10/6-10/8)',
    setter: '蔡欣妤 老師',
    scope: '', // 空白，等出題老師線上填寫
    formatNotes: '請說明翻譯題目來源與作文評分扣分標準。'
  }
];

// 115學年度書卷雜誌訂購資訊 (源自 115學年度書卷雜誌訂購 .docx)
const MAGAZINES_DATA = [
  {
    grade: '普高一年級 (Live ABC)',
    publisher: 'Live ABC 互動英語',
    months: '9、10、11、12月，及 2、3、4、5、6、8月 (共10期)',
    studentCounts: '普一1：45人 | 普一2：45人 (發放雜誌、週考卷、贈書)',
    unitQuizzes: '英一A：30份 | 英一B：30份 | 英一C：30份 (單元卷數量)',
    bonusBooks: '🎁 贈書：高頻二上贈送「核心單字」、二下贈送「中譯英」'
  },
  {
    grade: '普高二年級 (空中英語教室)',
    publisher: '空中英語教室',
    months: '9月、11月、12月 (共 3 期)',
    studentCounts: '普二1：41人 | 普二2：38人',
    unitQuizzes: '依班級學生人數配發試卷與學習雜誌。',
    bonusBooks: '🎁 配合二下學期進行聽力與閱讀能力培訓。'
  },
  {
    grade: '普高三年級 (常春藤解析英語)',
    publisher: '常春藤解析英語',
    months: '8、9、10、11、12月 (共 5 期)',
    studentCounts: '普三1：48人 | 普三2：26人 | 普三3：26人',
    unitQuizzes: '全班配發大卷、作文練習紙與聽力檔。',
    bonusBooks: '🎁 訂購 10 期加贈歷屆學測真題及模擬考題本。'
  }
];

// 高中部教學 MEMO (源自 高中部教學MEMO.docx)
const TEACHING_MEMO_DATA = [
  {
    category: '📖 期末雜誌考試範圍',
    items: [
      '【高一 LiveABC】5月：U5、U8 | 6月：U11、U13',
      '【普二 常春藤】5月：5/11、5/19 | 6月：6/11-12、6/16'
    ]
  },
  {
    category: '📚 普高英文選課不考課文說明',
    items: [
      '高一龍騰 B2：不考課文範圍 L2、L6、L9',
      '高二龍騰 B4：不考課文範圍 L3、L4、L9'
    ]
  },
  {
    category: '🗓️ 普一/普二 雜誌期數配送細節',
    items: [
      '普一 Live 雜誌：3、4、5、6、7、8 月號',
      '普二升三 常春藤雜誌：二下 3~8 月號、三上 9~12 月號 (訂購10期贈歷屆試題及模擬考題本)'
    ]
  },
  {
    category: '🏆 114-115學年度 語文競賽日程 MEMO',
    items: [
      '每年代下學期：辦理校內英文選手選拔',
      '4 月底：國中初賽線上報名',
      '6 月初：參加縣內語文競賽比賽',
      '7 月初：報名複賽 | 9 月：進行決賽'
    ]
  }
];

// 評量尺規 Excel 範本結構 (源自 英二A.xlsx - 遮蔽學生名單實施範本)
const RUBRIC_EXCEL_TEMPLATE_DATA = {
  fileName: '英二A.xlsx (114-2 / 115參考範本)',
  columns: ['班級', '姓名', '學號', '大卷1', '大卷2', '大卷3', '一段(20%)', '二段(20%)', '期末考(20%)', '小卷', '作業', '英聽', '課堂表現', '平常平均(40%)', '總成績'],
  sampleRows: [
    { class: '普通二 1', name: '杜〇恩 (5)', studentId: '313***', test1: 91, test2: 94, test3: 94, exam1: 98, exam2: 93, final: 96, quiz: 94, homework: 100, audio: 93, classPerf: 95, regAvg: 94.2, total: 90.5 },
    { class: '普通二 1', name: '林〇龍 (9)', studentId: '313***', test1: 77, test2: 76, test3: 94, exam1: 70, exam2: 85, final: 90, quiz: 94, homework: 75, audio: 88, classPerf: 95, regAvg: 85.4, total: 79.0 },
    { class: '普通二 1', name: '邱〇瑜 (11)', studentId: '313***', test1: 76, test2: 52, test3: 93, exam1: 85, exam2: 93, final: 90, quiz: 93, homework: 94, audio: 79, classPerf: 85, regAvg: 84.4, total: 84.0 },
    { class: '普通二 2', name: '許〇喆 (13)', studentId: '313***', test1: 80, test2: 92, test3: 94, exam1: 77, exam2: 79, final: 94, quiz: 94, homework: 83, audio: 86, classPerf: 90, regAvg: 87.2, total: 85.9 },
    { class: '普通二 3', name: '陳〇安 (14)', studentId: '313***', test1: 93, test2: 100, test3: 94, exam1: 95, exam2: 98, final: 100, quiz: 94, homework: 100, audio: 96, classPerf: 93, regAvg: 96.1, total: 96.4 }
  ]
};

// 預設教師科務協作任務清單
const INITIAL_TASKS = [
  {
    id: 'task_001',
    title: '線上填寫 普一 第一次段考 出題範圍與題型',
    assigneeId: 'lin_tian_yi',
    assigneeName: '林天宜 老師',
    grade: '普高一年級',
    subject: '英文',
    category: '段考出題',
    dueDate: '2026-10-05',
    status: 'in_progress',
    progress: 40,
    note: '等待出題老師線上更新範圍與配分比例。'
  },
  {
    id: 'task_002',
    title: '普一 英聽播音試題錄製與核對',
    assigneeId: 'chen_wen_tzong',
    assigneeName: '陳文宗 老師',
    grade: '普高一年級',
    subject: '英聽',
    category: '段考出題',
    dueDate: '2026-10-05',
    status: 'in_progress',
    progress: 60,
    note: '第 1 次段考播音準備。'
  },
  {
    id: 'task_003',
    title: '115學年度第一學期 雜誌與課本點收發放',
    assigneeId: 'ho_fei_ching',
    assigneeName: '何妃卿 老師',
    grade: '全高中部',
    subject: '科務行政',
    category: '圖書採購',
    dueDate: '2026-08-30',
    status: 'completed',
    progress: 100,
    note: '已完成 LiveABC (普一)、空中英語教室 (普二)、常春藤 (普三) 點收配送。'
  }
];

// Explicitly expose data to global window object for universal browser compatibility
if (typeof window !== 'undefined') {
  window.INITIAL_TEACHERS = INITIAL_TEACHERS;
  window.COURSE_ASSIGNMENTS = COURSE_ASSIGNMENTS;
  window.TIMELINE_DATA = TIMELINE_DATA;
  window.INITIAL_EXAM_SETTERS = INITIAL_EXAM_SETTERS;
  window.INITIAL_EXAM_SPECS = INITIAL_EXAM_SPECS;
  window.MAGAZINES_DATA = MAGAZINES_DATA;
  window.TEACHING_MEMO_DATA = TEACHING_MEMO_DATA;
  window.GRADING_RUBRICS_DATA = GRADING_RUBRICS_DATA;
  window.RUBRIC_EXCEL_TEMPLATE_DATA = RUBRIC_EXCEL_TEMPLATE_DATA;
  window.INITIAL_TASKS = INITIAL_TASKS;
}

