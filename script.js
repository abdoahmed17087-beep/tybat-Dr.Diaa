document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateBtn').addEventListener('click', askAI);
    document.getElementById('suggestBtn').addEventListener('click', suggestDay);

    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') askAI();
    });
});

// ضع مفتاح Cohere الخاص بك هنا
const COHERE_API_KEY = "ضع_مفتاح_كوهير_هنا"; 
const API_URL = "m31kydPbcVMdqYDIo37OKXzWyJZMVeKZMqhbexDG";

function checkFastingDay() {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day: 'numeric'}).format(today);
    const hijriDay = parseInt(hijriDate.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)));

    if (dayOfWeek === 1 || dayOfWeek === 4 || [13, 14, 15].includes(hijriDay)) {
        return "<strong style='color: #d32f2f;'>تنبيه: يجب الصيام اليوم (سنة مؤكدة).</strong><br><br>";
    }
    return "";
}

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
ممنوع الفراخ او الدجاج بجميع انواعها.
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
            preamble: systemPrompt, // هنا نضع تعليمات النظام
            model: "command-r-plus", // أو command-r
            temperature: 0.3
        })
    });

    if (!response.ok) {
        throw new Error("حدث خطأ في الاتصال بـ Cohere");
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
        resultDiv.innerHTML = answer.replace(/\n/g, '<br>');
    } catch (e) {
        resultDiv.style.display = "block";
        resultDiv.innerText = "خطأ: تأكد من مفتاح الـ API أو اتصال الإنترنت.";
        console.error(e);
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
        const answer = await callCohere("اقترح لي جدول وجبات ليوم كامل (إفطار، غداء، عشاء) بناءً على نظام الطيبات فقط.");
        resultDiv.style.display = "block";
        resultDiv.innerHTML = checkFastingDay() + answer.replace(/\n/g, '<br>');
    } catch (e) {
        resultDiv.style.display = "block";
        resultDiv.innerText = "خطأ في جلب الاقتراحات.";
    } finally {
        loading.style.display = "none";
    }
}
