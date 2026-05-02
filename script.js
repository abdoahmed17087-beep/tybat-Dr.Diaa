document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateBtn').addEventListener('click', askAI);
    document.getElementById('suggestBtn').addEventListener('click', suggestDay);

    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') askAI();
    });
});

// مفتاح Cohere الخاص بك
const COHERE_API_KEY = "cohere_OpasZec3NgCWGNwU5uutUNjS8Voqmp8RsdeuVw8g0E3NT7"; 
const API_URL = "https://api.cohere.ai/v1/chat";

// دالة فحص أيام الصيام حسب التقويم الهجري والميلادي
function checkFastingDay() {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day: 'numeric'}).format(today);
    const hijriDay = parseInt(hijriDate.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)));

    if (dayOfWeek === 1 || dayOfWeek === 4 || [13, 14, 15].includes(hijriDay)) {
        return "<div style='background: #fff3cd; padding: 10px; border-radius: 10px; border: 1px solid #ffeeba; margin-bottom: 15px; color: #856404;'>⚠️ <strong>تذكير:</strong> اليوم موافق لأيام الصيام (الاثنين/الخميس أو الأيام البيض).</div>";
    }
    return "";
}

// منهج نظام الطيبات بالكامل كما طلبته
const systemPrompt = `
أنت المساعد الرسمي لمنهج "نظام الطيبات" للدكتور ضياء العوضي.
التزم بالقواعد التالية بدقة عند الرد ولا تخرج عنها أبداً:

المعلومات الأساسية:
الماء عند الحاجة.

المسموحات (يُسمح بتكرارها يومياً):
النشويات: الأرز، البطاطس.
البروتينات: اللحوم (خروف، بقري، جملي)، الحمام، الكبدة.
الأسماك: مرة واحدة في الشهر فقط.
الفواكه: التمور، العنب، الجوافة (بدون بذر)، الرمان (بدون بذر)، التين، الموز، الفراولة، المشمش، البخارة (برقوق).
إضافات: زيتون، زبدة، مربى، نوتيلا، عسل، توست النخالة، جبن (شيدر، جودة، فلمنك).
المشروبات: الشاي الأخضر فقط.

الممنوعات (يُمنع منعاً باتاً):
الدقيق ومشتقاته، المكرونة.
المشروبات الغازية، الشاي الأحمر.
الحليب ومشتقاته (قريش، أجبان طازجة، رايب).
البيض، الدجاج، الجمبري، الحبار.
البقوليات (فول، بسلة، لوبيا، فول سوداني).
الورقيات، الخضروات، البطيخ، الشمام.

قواعد التشغيل:
الأكل عند الجوع فقط.
عند تقديم أي نصيحة، وضح السبب العلمي (كيميائي/حيوي) حسب منهج الدكتور ضياء العوضي.
شجع المستخدم على التدرج في تغيير العادات.
إذا سُئلت عن شيء غير موجود في القوائم أعلاه، اعتذر بوضوح لعدم توفر المعلومة في منهج النظام.
اختم نهاية الإجابة دائماً بجملة: "هذه المعلومات قائمة على منهج نظام الطيبات للدكتور ضياء العوضي، ولا تغني عن التشخيص الطبي المتخصص".
`;

async function callCohere(message) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${COHERE_API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            message: message,
            preamble: systemPrompt,
            model: "command-r-08-2024", 
            temperature: 0.3
        })
    });

    if (!response.ok) {
        throw new Error("عذراً، حدث خطأ في الاتصال بالخادم. تأكد من رصيد الـ API.");
    }

    const data = await response.json();
    return data.text;
}

async function askAI() {
    const input = document.getElementById('userInput').value;
    const resultDiv = document.getElementById('mealResult');
    const loading = document.getElementById('loading');

    if (!input.trim()) return alert("اكتب سؤالك أولاً!");

    loading.style.display = "flex";
    resultDiv.style.display = "none";

    try {
        const answer = await callCohere(input);
        resultDiv.style.display = "block";
        // تحويل السطور الجديدة إلى <br> وإضافة تنسيق للنقاط
        resultDiv.innerHTML = answer.replace(/\n/g, '<br>');
    } catch (e) {
        resultDiv.style.display = "block";
        resultDiv.innerHTML = `<span style="color:red">⚠️ ${e.message}</span>`;
    } finally {
        loading.style.display = "none";
    }
}

async function suggestDay() {
    const resultDiv = document.getElementById('suggestResult');
    const loading = document.getElementById('suggestLoading');

    loading.style.display = "flex";
    resultDiv.style.display = "none";

    try {
        const answer = await callCohere("اقترح لي جدول وجبات ليوم كامل (إفطار، غداء، عشاء) بناءً على مسموحات نظام الطيبات فقط.");
        resultDiv.style.display = "block";
        resultDiv.innerHTML = checkFastingDay() + answer.replace(/\n/g, '<br>');
    } catch (e) {
        resultDiv.style.display = "block";
        resultDiv.innerText = "حدث خطأ أثناء جلب الاقتراحات.";
    } finally {
        loading.style.display = "none";
    }
}
