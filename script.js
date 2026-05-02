document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('generateBtn').addEventListener('click', askAI);
    document.getElementById('suggestBtn').addEventListener('click', suggestDay);

    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') askAI();
    });
});

// المفتاح الخاص بك موضوع هنا بشكل كامل وسليم
const API_KEY = "AIzaSyAxHdQ8fChO4nVOE2CrAVj9M58ButgRY_Q";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// دالة فحص الصيام (تظهر في جدول اليوم فقط)
function checkFastingDay() {
    const today = new Date();
    const dayOfWeek = today.getDay(); 
    const hijriDate = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {day: 'numeric'}).format(today);
    const hijriDay = parseInt(hijriDate.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)));

    if (dayOfWeek === 1 || dayOfWeek === 4 || [13, 14, 15].includes(hijriDay)) {
        return "<strong style='color: #d32f2f;'>يجب الصيام اليوم.</strong><br><br>";
    }
    return "";
}

const systemPrompt = `
أنت المساعد الرسمي لمنهج "نظام الطيبات" للدكتور ضياء العوضي.
التزم بالقواعد التالية بدقة عند الرد ولا تخرج عنها أبداً:

المعلومات الأساسية:
- الماء عند الحاجة.

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
- الحليب ومشتقاته (قريش، أجبان طازجة، رايب).
- البيض، الدجاج، الجمبري، الحبار.
- البقوليات (فول، بسلة، لوبيا، فول سوداني).
- الورقيات، الخضروات، البطيخ، الشمام.

قواعد التشغيل:
- الأكل عند الجوع فقط.
- عند تقديم أي نصيحة، وضح السبب العلمي (كيميائي/حيوي) حسب منهج الدكتور ضياء العوضي.
- شجع المستخدم على التدرج في تغيير العادات.
- إذا سُئلت عن شيء غير موجود في القوائم أعلاه، اعتذر بوضوح لعدم توفر المعلومة في منهج النظام.
- اختم نهاية الإجابة دائماً بجملة: "هذه المعلومات قائمة على منهج نظام الطيبات للدكتور ضياء العوضي، ولا تغني عن التشخيص الطبي المتخصص".
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt + "\n\nسؤال المستخدم: " + input }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();
        resultDiv.style.display = "block";
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            resultDiv.innerHTML = data.candidates[0].content.parts[0].text.replace(/\n/g, '<br>');
        } else {
            resultDiv.innerText = "عذراً، حدث خطأ في معالجة الإجابة.";
        }
    } catch (e) {
        resultDiv.style.display = "block";
        resultDiv.innerText = "خطأ في الاتصال بالسيرفر.";
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: systemPrompt + "\n\nاقترح لي جدول وجبات ليوم كامل بناءً على نظام الطيبات فقط." }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();
        resultDiv.style.display = "block";
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            resultDiv.innerHTML = checkFastingDay() + data.candidates[0].content.parts[0].text.replace(/\n/g, '<br>');
        } else {
            resultDiv.innerText = "عذراً، حدث خطأ في جلب الاقتراحات.";
        }
    } catch (e) {
        resultDiv.style.display = "block";
        resultDiv.innerText = "خطأ في جلب الاقتراحات.";
    } finally {
        loading.style.display = "none";
    }
}
