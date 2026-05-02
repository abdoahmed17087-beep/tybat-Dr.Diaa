document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateBtn').addEventListener('click', askAI);
    document.getElementById('suggestBtn').addEventListener('click', suggestDay);

    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') askAI();
    });
});

const API_KEY = "NBz0opq47Fq2d1lrdIUPaOsUlCxjQRl5vIr3EUAM";
const API_URL = "/api/chat";

// دالة فحص الصيام (تستخدم فقط في المقترح اليومي)
function checkFastingDay() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 1=الاثنين، 4=الخميس
    const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day: 'numeric'}).format(today);
    const hijriDay = parseInt(hijriDate.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)));

    if (dayOfWeek === 1 || dayOfWeek === 4 || [13, 14, 15].includes(hijriDay)) {
        return "<strong style='color: #d32f2f;'>يوجد صيام اليوم.</strong><br><br>";
    }
    return "";
}

const systemPrompt = `
أنت المساعد الرسمي لمنهج "نظام الطيبات" للدكتور ضياء العوضي.
مرجعك الوحيد هو القوائم التالية، لا تخرج عنها أبداً:

معلومة: الماء عند الحاجة

1. المسموحات (يُسمح بتكرارها يومياً):
- النشويات: الأرز، البطاطس.
- البروتينات: اللحوم (خروف، بقري، جملي)، الحمام، الكبدة.
- الأسماك: مرة واحدة في الشهر فقط.
- الفواكه: التمور، العنب، الجوافة (بدون بذر)، الرمان (بدون بذر)، التين، الموز، الفراولة، المشمش، البخارة (برقوق).
- إضافات: زيتون، زبدة، مربى، نوتيلا، عسل، توست النخالة، جبن (شيدر، جودة، فلمنك).
- المشروبات: الشاي الأخضر فقط.

2. الممنوعات (يُمنع منعاً باتاً):
- الدقيق ومشتقاته، المكرونة.
- المشروبات الغازية، الشاي الأحمر.
-الدجاج بجميع انواعة وجميع مشتقاتة مثل الكبد والقوانص واي شيء متعلق بالفراخ.
- الحليب ومشتقاته (قريش، أجبان طازجة، رايب).
- البيض، الدجاج، الجمبري، الحبار.
- البقوليات (فول، بسلة، لوبيا، فول سوداني).
- الورقيات، الخضروات، البطيخ، الشمام.

3. قواعد التشغيل:
- الأكل عند الجوع فقط.
- عند تقديم أي نصيحة، وضح السبب العلمي (كيميائي/حيوي) حسب منهج الدكتور ضياء.
- شجع المستخدم على التدرج في تغيير العادات.
- إذا سُئلت عن شيء غير موجود في القوائم أعلاه، اعتذر بوضوح لعدم توفر المعلومة في منهج النظام.
- اختم دائماً بجملة: "هذه المعلومات قائمة على منهج نظام الطيبات للدكتور ضياء العوضي، ولا تغني عن التشخيص الطبي المتخصص".
`;

async function askAI() {
    const input = document.getElementById('userInput').value;
    const resultDiv = document.getElementById('mealResult');
    const loading = document.getElementById('loading');

    if (!input.trim()) return alert("اكتب سؤالك أولاً!");

    loading.style.display = "flex";
    resultDiv.style.display = "none";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ message: input, preamble: systemPrompt, model: "command-r-08-2024", temperature: 0.3 })
        });
        const data = await response.json();
        resultDiv.style.display = "block";
        // هنا تظهر الإجابة مباشرة بدون تنبيه الصيام
        resultDiv.innerHTML = data.text.replace(/\n/g, '<br>');
    } catch (e) {
        resultDiv.style.display = "block";
        resultDiv.innerText = "خطأ في الاتصال.";
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
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: "اقترح لي جدول وجبات ليوم كامل بناءً على نظام الطيبات فقط.", 
                preamble: systemPrompt, 
                model: "command-r-08-2024",
                temperature: 0.6
            })
        });
        const data = await response.json();
        resultDiv.style.display = "block";
        // هنا يظهر تنبيه الصيام مع المقترح
        resultDiv.innerHTML = checkFastingDay() + data.text.replace(/\n/g, '<br>');
    } catch (e) {
        resultDiv.style.display = "block";
        resultDiv.innerText = "خطأ في جلب الاقتراحات.";
    } finally {
        loading.style.display = "none";
    }
}
