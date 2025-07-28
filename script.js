// script.js

// 로컬 스토리지에서 데이터 가져오기
let vocabulary = JSON.parse(localStorage.getItem('vocabulary')) || [];
let quizScore = 0;
let currentQuizType = '';
let currentQuestionIndex = 0;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', function() {
    displayVocabulary();
    displayDailyContent();
    
    // 부드러운 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// 오늘의 단어와 명언 표시
function displayDailyContent() {
    const dailyWords = [
        { word: "perseverance", meaning: "인내, 끈기" },
        { word: "accomplish", meaning: "성취하다, 완수하다" },
        { word: "enthusiasm", meaning: "열정, 열의" },
        { word: "opportunity", meaning: "기회" },
        { word: "challenge", meaning: "도전" }
    ];
    
    const dailyQuotes = [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
        "The only impossible journey is the one you never begin. - Tony Robbins"
    ];
    
    const today = new Date().getDay();
    const wordIndex = today % dailyWords.length;
    const quoteIndex = today % dailyQuotes.length;
    
    document.getElementById('daily-word-display').textContent = dailyWords[wordIndex].word;
    document.getElementById('daily-word-meaning').textContent = dailyWords[wordIndex].meaning;
    document.getElementById('daily-quote-display').textContent = dailyQuotes[quoteIndex];
}

// 섹션으로 스크롤
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
}

// 단어 추가
function addWord() {
    const wordInput = document.getElementById('word-input');
    const meaningInput = document.getElementById('meaning-input');
    
    if (wordInput.value && meaningInput.value) {
        const newWord = {
            id: Date.now(),
            word: wordInput.value,
            meaning: meaningInput.value
        };
        
        vocabulary.push(newWord);
        localStorage.setItem('vocabulary', JSON.stringify(vocabulary));
        
        wordInput.value = '';
        meaningInput.value = '';
        
        displayVocabulary();
    } else {
        alert('단어와 뜻을 모두 입력해주세요!');
    }
}

// 단어장 표시
function displayVocabulary() {
    const vocabList = document.getElementById('vocab-list');
    vocabList.innerHTML = '';
    
    vocabulary.forEach(item => {
        const vocabItem = document.createElement('div');
        vocabItem.className = 'vocab-item';
        vocabItem.innerHTML = `
            <div>
                <strong>${item.word}</strong> - ${item.meaning}
            </div>
            <button class="delete-btn" onclick="deleteWord(${item.id})">삭제</button>
        `;
        vocabList.appendChild(vocabItem);
    });
}

// 단어 삭제
function deleteWord(id) {
    vocabulary = vocabulary.filter(item => item.id !== id);
    localStorage.setItem('vocabulary', JSON.stringify(vocabulary));
    displayVocabulary();
}

// 퀴즈 시작
function startQuiz(type) {
    currentQuizType = type;
    currentQuestionIndex = 0;
    quizScore = 0;
    
    if (type === 'vocabulary') {
        if (vocabulary.length < 4) {
            alert('퀴즈를 시작하려면 최소 4개 이상의 단어가 필요합니다!');
            return;
        }
        showVocabularyQuiz();
    } else if (type === 'grammar') {
        showGrammarQuiz();
    }
}

// 단어 퀴즈 표시
function showVocabularyQuiz() {
    const quizArea = document.getElementById('quiz-area');
    const randomIndex = Math.floor(Math.random() * vocabulary.length);
    const correctWord = vocabulary[randomIndex];
    
    // 오답 선택지 생성
    let options = [correctWord];
    while (options.length < 4) {
        const randomOption = vocabulary[Math.floor(Math.random() * vocabulary.length)];
        if (!options.find(opt => opt.id === randomOption.id)) {
            options.push(randomOption);
        }
    }
    
    // 선택지 섞기
    options.sort(() => Math.random() - 0.5);
    
    const questionHTML = `
        <div id="quiz-question">"${correctWord.word}"의 뜻은?</div>
        <div id="quiz-options">
            ${options.map(opt => `
                <button class="quiz-option" onclick="checkAnswer('${opt.meaning}', '${correctWord.meaning}')">${opt.meaning}</button>
            `).join('')}
        </div>
        <div id="quiz-result"></div>
        <div id="quiz-score">점수: ${quizScore}</div>
    `;
    
    quizArea.innerHTML = questionHTML;
}

// 문법 퀴즈 표시
function showGrammarQuiz() {
    const grammarQuestions = [
        {
            question: "Choose the correct form: 'She ___ to school every day.'",
            options: ["go", "goes", "going", "gone"],
            correct: "goes"
        },
        {
            question: "Which sentence is in the present perfect tense?",
            options: [
                "I am reading a book.",
                "I have read this book.",
                "I read books often.",
                "I will read tomorrow."
            ],
            correct: "I have read this book."
        },
        {
            question: "Choose the correct passive form: 'The letter ___ by John.'",
            options: ["wrote", "was written", "has wrote", "writing"],
            correct: "was written"
        }
    ];
    
    const currentQuestion = grammarQuestions[currentQuestionIndex % grammarQuestions.length];
    
    const questionHTML = `
        <div id="quiz-question">${currentQuestion.question}</div>
        <div id="quiz-options">
            ${currentQuestion.options.map(opt => `
                <button class="quiz-option" onclick="checkAnswer('${opt}', '${currentQuestion.correct}')">${opt}</button>
            `).join('')}
        </div>
        <div id="quiz-result"></div>
        <div id="quiz-score">점수: ${quizScore}</div>
    `;
    
    document.getElementById('quiz-area').innerHTML = questionHTML;
}

// 답 확인
function checkAnswer(selected, correct) {
    const options = document.querySelectorAll('.quiz-option');
    const result = document.getElementById('quiz-result');
    
    options.forEach(option => {
        option.disabled = true;
        if (option.textContent === correct) {
            option.classList.add('correct');
        } else if (option.textContent === selected && selected !== correct) {
            option.classList.add('incorrect');
        }
    });
    
    if (selected === correct) {
        quizScore += 10;
        result.innerHTML = '<p style="color: #27ae60;">정답입니다! 🎉</p>';
    } else {
        result.innerHTML = '<p style="color: #e74c3c;">틀렸습니다. 다시 도전해보세요!</p>';
    }
    
    document.getElementById('quiz-score').textContent = `점수: ${quizScore}`;
    
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuizType === 'vocabulary') {
            showVocabularyQuiz();
        } else {
            showGrammarQuiz();
        }
    }, 2000);
}

// 문법 내용 표시
function showGrammar(topic) {
    const grammarContent = document.getElementById('grammar-content');
    const content = {
        tenses: `
            <h3>영어 시제 (Tenses)</h3>
            <h4>1. 현재시제 (Present Tense)</h4>
            <p><strong>단순 현재:</strong> I study English every day.</p>
            <p><strong>현재 진행:</strong> I am studying English now.</p>
            <p><strong>현재 완료:</strong> I have studied English for 3 years.</p>
            
            <h4>2. 과거시제 (Past Tense)</h4>
            <p><strong>단순 과거:</strong> I studied English yesterday.</p>
            <p><strong>과거 진행:</strong> I was studying when you called.</p>
            <p><strong>과거 완료:</strong> I had studied before the test.</p>
            
            <h4>3. 미래시제 (Future Tense)</h4>
            <p><strong>단순 미래:</strong> I will study English tomorrow.</p>
            <p><strong>미래 진행:</strong> I will be studying at 3 PM.</p>
        `,
        conditionals: `
            <h3>조건문 (Conditionals)</h3>
            <h4>Zero Conditional (일반적 사실)</h4>
            <p>If + 현재시제, 현재시제</p>
            <p><strong>예:</strong> If you heat water to 100°C, it boils.</p>
            
            <h4>First Conditional (가능한 미래)</h4>
            <p>If + 현재시제, will + 동사원형</p>
            <p><strong>예:</strong> If it rains tomorrow, I will stay home.</p>
            
            <h4>Second Conditional (가정법 과거)</h4>
            <p>If + 과거시제, would + 동사원형</p>
            <p><strong>예:</strong> If I were rich, I would travel the world.</p>
            
            <h4>Third Conditional (불가능한 과거)</h4>
            <p>If + 과거완료, would have + 과거분사</p>
            <p><strong>예:</strong> If I had studied harder, I would have passed the exam.</p>
        `,
        passive: `
            <h3>수동태 (Passive Voice)</h3>
            <h4>수동태 만들기</h4>
            <p>be동사 + 과거분사 (+ by + 행위자)</p>
            
            <h4>시제별 수동태</h4>
            <p><strong>현재:</strong> The book is read by many students.</p>
            <p><strong>과거:</strong> The letter was written by John.</p>
            <p><strong>미래:</strong> The project will be completed next week.</p>
            <p><strong>현재완료:</strong> The homework has been finished.</p>
            
            <h4>수동태를 사용하는 경우</h4>
            <ul>
                <li>행위자가 불분명하거나 중요하지 않을 때</li>
                <li>행위의 대상이 더 중요할 때</li>
                <li>객관적인 표현이 필요할 때</li>
            </ul>
        `,
        reported: `
            <h3>간접화법 (Reported Speech)</h3>
            <h4>시제 변화</h4>
            <p><strong>현재 → 과거:</strong> "I am happy" → He said he was happy.</p>
            <p><strong>과거 → 과거완료:</strong> "I went" → He said he had gone.</p>
            <p><strong>will → would:</strong> "I will come" → He said he would come.</p>
            
            <h4>의문문의 간접화법</h4>
            <p><strong>Yes/No 의문문:</strong> "Are you ready?" → He asked if I was ready.</p>
            <p><strong>Wh- 의문문:</strong> "Where do you live?" → He asked where I lived.</p>
            
            <h4>명령문의 간접화법</h4>
            <p><strong>명령:</strong> "Close the door" → He told me to close the door.</p>
            <p><strong>부정명령:</strong> "Don't run" → He told me not to run.</p>
        `
    };
    
     grammarContent.innerHTML = content[topic] || '<p>내용을 준비 중입니다.</p>';
}

// 학습 자료 표시
function showResources(type) {
    const resourceDisplay = document.getElementById('resource-display');
    resourceDisplay.style.display = 'block';
    
    const resources = {
        reading: `
            <h3>읽기 자료</h3>
            <div class="resource-item">
                <h4>초급 읽기 자료</h4>
                <p>• Daily Routines - 일상생활에 관한 짧은 글</p>
                <p>• My Family - 가족 소개 글</p>
                <p>• Seasons and Weather - 계절과 날씨</p>
            </div>
            <div class="resource-item">
                <h4>중급 읽기 자료</h4>
                <p>• Technology in Our Lives - 기술과 우리 생활</p>
                <p>• Environmental Issues - 환경 문제</p>
                <p>• Cultural Differences - 문화적 차이</p>
            </div>
            <div class="resource-item">
                <h4>고급 읽기 자료</h4>
                <p>• Global Economics - 세계 경제</p>
                <p>• Scientific Discoveries - 과학적 발견</p>
                <p>• Literary Analysis - 문학 작품 분석</p>
            </div>
        `,
        listening: `
            <h3>듣기 자료</h3>
            <div class="resource-item">
                <h4>일상 대화 듣기</h4>
                <p>• At the Restaurant - 레스토랑에서의 대화</p>
                <p>• Shopping Conversations - 쇼핑 대화</p>
                <p>• Making Appointments - 약속 잡기</p>
            </div>
            <div class="resource-item">
                <h4>뉴스 듣기</h4>
                <p>• BBC Learning English - 영국 뉴스</p>
                <p>• VOA Learning English - 미국 뉴스</p>
                <p>• CNN Student News - 학생용 뉴스</p>
            </div>
            <div class="resource-item">
                <h4>팟캐스트 추천</h4>
                <p>• English as a Second Language Podcast</p>
                <p>• 6 Minute English by BBC</p>
                <p>• TED Talks Daily</p>
            </div>
        `,
        videos: `
            <h3>동영상 강의</h3>
            <div class="resource-item">
                <h4>문법 강의</h4>
                <p>• Present Perfect vs Past Simple</p>
                <p>• Modal Verbs Explained</p>
                <p>• Phrasal Verbs Made Easy</p>
            </div>
            <div class="resource-item">
                <h4>발음 강의</h4>
                <p>• English Pronunciation Guide</p>
                <p>• American vs British Accent</p>
                <p>• Intonation and Stress Patterns</p>
            </div>
            <div class="resource-item">
                <h4>회화 강의</h4>
                <p>• Daily English Conversations</p>
                <p>• Business English Essentials</p>
                <p>• Travel English Phrases</p>
            </div>
        `
    };
    
    resourceDisplay.innerHTML = resources[type] || '<p>자료를 준비 중입니다.</p>';
    
    // 자료 섹션으로 스크롤
    resourceDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Enter 키로 단어 추가
document.getElementById('word-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('meaning-input').focus();
    }
});

document.getElementById('meaning-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addWord();
    }
});

// 페이지 로드 시 애니메이션
window.addEventListener('load', function() {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(section);
    });
});

// 단어장 내보내기 기능 (추가 기능)
function exportVocabulary() {
    const dataStr = JSON.stringify(vocabulary, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'my_vocabulary.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// 단어장 가져오기 기능 (추가 기능)
function importVocabulary(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const imported = JSON.parse(e.target.result);
                vocabulary = [...vocabulary, ...imported];
                localStorage.setItem('vocabulary', JSON.stringify(vocabulary));
                displayVocabulary();
                alert('단어장을 성공적으로 가져왔습니다!');
            } catch (error) {
                alert('파일을 읽는 중 오류가 발생했습니다.');
            }
        };
        reader.readAsText(file);
    }
}

// 학습 진도 추적 (추가 기능)
function trackProgress() {
    const progress = {
        totalWords: vocabulary.length,
        quizzesTaken: Math.floor(quizScore / 10),
        lastStudied: new Date().toLocaleDateString()
    };
    
    localStorage.setItem('studyProgress', JSON.stringify(progress));
    return progress;
}

// 단어 검색 기능 (추가 기능)
function searchVocabulary(searchTerm) {
    const filtered = vocabulary.filter(item => 
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const vocabList = document.getElementById('vocab-list');
    vocabList.innerHTML = '';
    
    filtered.forEach(item => {
        const vocabItem = document.createElement('div');
        vocabItem.className = 'vocab-item';
        vocabItem.innerHTML = `
            <div>
                <strong>${item.word}</strong> - ${item.meaning}
            </div>
            <button class="delete-btn" onclick="deleteWord(${item.id})">삭제</button>
        `;
        vocabList.appendChild(vocabItem);
    });
}

// 다크 모드 토글 (추가 기능)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

// 페이지 로드 시 다크 모드 확인
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}