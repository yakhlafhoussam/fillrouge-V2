(function () {
    // ---------- DATES ----------
    const targetDate = new Date(2026, 4, 5, 0, 0, 0);
    const seasonStart = new Date(2025, 9, 7, 0, 0, 0);
    const seasonEnd = new Date(2026, 4, 5, 0, 0, 0);

    // DOM Elements
    const selectionScreen = document.getElementById('selectionScreen');
    const galleryScreen = document.getElementById('galleryScreen');
    const finalUI = document.getElementById('finalUI');
    const backToClassesBtn = document.getElementById('backToClassesBtn');
    const classesGrid = document.getElementById('classesGrid');
    const classesCountSpan = document.getElementById('classesCount');
    const classBadgeSpan = document.getElementById('classBadge');
    const classFooterSpan = document.getElementById('classFooterSpan');
    const selectedClassNameSpan = document.getElementById('selectedClassName');
    const memberCountSpan = document.getElementById('memberCountSpan');

    // Gallery elements
    const learnerSpan = document.getElementById('learnerMessage');
    const pointsValueSpan = document.getElementById('pointsValue');
    const roleDisplaySpan = document.getElementById('roleDisplay');
    const studentImagesContainer = document.getElementById('studentImagesContainer');
    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');

    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    const circumference = 2 * Math.PI * 45;

    let allClasses = [];
    let currentMembers = [];
    let currentIndex = 0;
    let imageElements = [];
    let rotationInterval = null;
    let timerInterval = null;
    let currentSelectedClass = '';

    // Custom name mapping function
    function formatDisplayName(name) {
        if (!name) return name;
        // Change "Houssam Yakhlaf" to "Houssam YK"
        if (name === "Houssam Yakhlaf" || name.includes("Houssam Yakhlaf")) {
            return "Houssam YK";
        }
        return name;
    }

    // Custom photo URL mapping
    function getCustomPhotoUrl(name, defaultPhotoUrl) {
        if (!name) return defaultPhotoUrl;
        // Saad Haimeur custom photo
        if (name === "Saad HAIMEUR" || name === "Saad Haimeur") {
            return "https://media.licdn.com/dms/image/v2/D4E03AQHg8vsMEiI6Fw/profile-displayphoto-crop_800_800/B4EZgof51cGwAM-/0/1753026111079?e=1775692800&v=beta&t=9-B1jmrV-5jhrzBBacM6th8IgCA7FT-QdIKY8C5Bdy0";
        }
        return defaultPhotoUrl;
    }

    function buildPhotoUrl(photoPath) {
        if (!photoPath) return null;
        if (photoPath.startsWith('http://') || photoPath.startsWith('https://') || photoPath.startsWith('//')) {
            return photoPath;
        }
        return `https://intranet.youcode.ma/storage/users/profile/${photoPath}`;
    }

    // Fetch all classes
    async function fetchAllClasses() {
        try {
            const apiUrl = "https://youcode-extranet-production.up.railway.app/api/classes?campus_id=6956cafb7b4b4bf2370ac677&user_type_id=6956caf17b4b4bf2370ac673&_v=11";

            const proxies = [
                `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
                `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
                apiUrl
            ];

            let data = null;
            for (const proxyUrl of proxies) {
                try {
                    const response = await fetch(proxyUrl, { cache: 'no-store' });
                    if (response.ok) {
                        data = await response.json();
                        break;
                    }
                } catch (err) {
                    console.warn(`Failed with ${proxyUrl}:`, err);
                    continue;
                }
            }

            if (!data || !data.classes) {
                throw new Error("Failed to fetch classes");
            }

            allClasses = data.classes;
            displayClasses();
            classBadgeSpan.innerHTML = `📚 ${allClasses.length} Classes · Safi Campus`;
            return true;
        } catch (err) {
            console.error("Error fetching classes:", err);
            classBadgeSpan.innerHTML = `⚠️ Using demo classes`;

            // Fallback classes with updated data
            allClasses = [
                { name: "GryffindorElites", studentCount: 17, image: "https://intranet.youcode.ma/storage/classrooms/146-1759851626.jpg", staff: [{ name: "Mohamed Yassine Bahajou", photo: "28-1665941748.jpg" }] },
                { name: "DebuGGers", studentCount: 24, image: "https://intranet.youcode.ma/storage/classrooms/0.jpeg", staff: [{ name: "Saad HAIMEUR", photo: null }] },
                { name: "GenZDevs", studentCount: 23, image: "https://intranet.youcode.ma/storage/classrooms/151-1770624273.jpg", staff: [{ name: "Abdeladim Abid", photo: "16-1773227461.png" }] },
                { name: "NextLine 2025-2026", studentCount: 24, image: "https://intranet.youcode.ma/storage/classrooms/0.jpeg", staff: [{ name: "Achraf Chaoub", photo: "34-1669653739.jpg" }] },
                { name: "SaiyansCoders", studentCount: 22, image: "https://intranet.youcode.ma/storage/classrooms/147-1759924167.png", staff: [{ name: "Houssni OUCHAD", photo: "1008-1709580550.jpg" }] }
            ];
            displayClasses();
            return false;
        }
    }

    function displayClasses() {
        classesGrid.innerHTML = '';
        allClasses.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'class-card';
            card.onclick = () => selectClass(cls.name);
            card.innerHTML = `
            <div class="flex items-center gap-4 mb-3">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                ${cls.name.charAt(0)}
              </div>
              <div class="flex-1">
                <h3 class="text-white font-bold text-lg">${cls.name}</h3>
                <p class="text-gray-400 text-sm">🎓 ${cls.studentCount} students</p>
              </div>
            </div>
            <div class="mt-3 pt-3 border-t border-gray-700/50">
              <p class="text-blue-400 text-xs">👥 Staff: ${cls.staff?.[0]?.name || 'Loading...'}</p>
            </div>
          `;
            classesGrid.appendChild(card);
        });
        classesCountSpan.innerText = `${allClasses.length} classes available. Click any class to view members.`;
    }

    // Fetch specific class details
    async function fetchClassDetails(className) {
        try {
            const apiUrl = `https://youcode-extranet-production.up.railway.app/api/classes/${encodeURIComponent(className)}?_v=11`;

            const proxies = [
                `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
                `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
                apiUrl
            ];

            let classData = null;
            for (const proxyUrl of proxies) {
                try {
                    const response = await fetch(proxyUrl, { cache: 'no-store' });
                    if (response.ok) {
                        classData = await response.json();
                        break;
                    }
                } catch (err) {
                    continue;
                }
            }

            if (!classData || !classData.class) {
                throw new Error("Failed to fetch class details");
            }

            return classData.class;
        } catch (err) {
            console.error("Error fetching class details:", err);
            return null;
        }
    }

    // Load and display selected class
    async function selectClass(className) {
        currentSelectedClass = className;

        // Show loading state in gallery
        selectionScreen.classList.add('hidden');
        galleryScreen.classList.remove('hidden');
        backToClassesBtn.classList.remove('hidden');

        learnerSpan.innerText = "Loading class data...";
        studentImagesContainer.innerHTML = '<div class="loader-mini"></div>';
        selectedClassNameSpan.innerText = className;
        classFooterSpan.innerText = className;

        const classInfo = await fetchClassDetails(className);

        if (!classInfo) {
            useFallbackData(className);
            return;
        }

        const campusName = classInfo.campus?.name || "Safi";
        const levelName = classInfo.level?.name || "1st Year";
        classBadgeSpan.innerHTML = `${className} · ${campusName} · ${levelName}`;

        // Process STUDENTS with name formatting
        const rawStudents = classInfo.students || [];
        const studentsList = rawStudents.map(s => ({
            name: formatDisplayName(s.name || "Anonymous"),
            photoUrl: getCustomPhotoUrl(s.name, s.photo ? buildPhotoUrl(s.photo) : null),
            points: s.points !== undefined && s.points !== null ? s.points : 0,
            role: "student",
            pointsVariation: s.pointsVariation || 0
        }));

        // Process STAFF with name formatting and custom photo
        const rawStaff = classInfo.staff || [];
        const staffList = rawStaff.map(st => ({
            name: formatDisplayName(st.name || "Staff Member"),
            photoUrl: getCustomPhotoUrl(st.name, st.photo ? buildPhotoUrl(st.photo) : null),
            points: st.points !== undefined && st.points !== null ? st.points : null,
            role: "staff",
            pointsVariation: st.pointsVariation || 0
        }));

        currentMembers = [...staffList, ...studentsList];

        // Add Abdelaziz Ait Hassain to DebuGGers class
        if (className === "DebuGGers" || className === "DebuGGers" || className.toLowerCase().includes("debug")) {
            currentMembers.push({
                name: "Abdelaziz Ait Hassain",
                photoUrl: "https://intranet.youcode.ma/storage/users/profile/31-1665940793.jpg",
                points: 0,
                role: "student",
                pointsVariation: 0
            });
        }

        if (currentMembers.length === 0) {
            currentMembers = [{ name: "No members found", photoUrl: null, points: 0, role: "student" }];
        }

        const staffCount = currentMembers.filter(m => m.role === "staff").length;
        const studentCount = currentMembers.filter(m => m.role === "student").length;
        memberCountSpan.innerText = `${currentMembers.length} members (${staffCount} staff, ${studentCount} students)`;

        buildGalleryFromMembers();
        startRotation();
    }

    function useFallbackData(className) {
        const fallbackData = {
            "GryffindorElites": [
                { name: "Prof. Mohamed Yassine Bahajou", photoUrl: "https://intranet.youcode.ma/storage/users/profile/28-1665941748.jpg", points: null, role: "staff" },
                { name: "Khadija Abirat", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1519-1760996184.png", points: 447, role: "student" },
                { name: "Yassin Maftah", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1877-1760996507.png", points: 438, role: "student" },
                { name: "Zakarya Hari", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1684-1760996356.png", points: 434, role: "student" },
                { name: "Nourelhouda Tajat", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1680-1760996352.png", points: 411, role: "student" },
                { name: "Houssam YK", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1720-1760996396.png", points: 250, role: "student" }
            ],
            "DebuGGers": [
                { name: "Saad HAIMEUR", photoUrl: "https://media.licdn.com/dms/image/v2/D4E03AQHg8vsMEiI6Fw/profile-displayphoto-crop_800_800/B4EZgof51cGwAM-/0/1753026111079?e=1775692800&v=beta&t=9-B1jmrV-5jhrzBBacM6th8IgCA7FT-QdIKY8C5Bdy0", points: null, role: "staff" },
                { name: "Abdelaziz Ait Hassain", photoUrl: "https://intranet.youcode.ma/storage/users/profile/31-1665940793.jpg", points: 320, role: "student" }
            ],
            "GenZDevs": [
                { name: "Abdeladim Abid", photoUrl: "https://intranet.youcode.ma/storage/users/profile/16-1773227461.png", points: null, role: "staff" }
            ]
        };

        currentMembers = fallbackData[className] || [
            { name: className, photoUrl: null, points: 0, role: "student" }
        ];

        const staffCount = currentMembers.filter(m => m.role === "staff").length;
        const studentCount = currentMembers.filter(m => m.role === "student").length;
        memberCountSpan.innerText = `${currentMembers.length} members (${staffCount} staff, ${studentCount} students)`;
        classBadgeSpan.innerHTML = `${className} · Demo Mode`;

        buildGalleryFromMembers();
        startRotation();
    }

    function buildGalleryFromMembers() {
        studentImagesContainer.innerHTML = '';
        imageElements = [];

        if (!currentMembers.length) return;

        currentMembers.forEach((member, idx) => {
            const img = document.createElement('img');
            img.id = `member_img_${idx}`;
            const defaultAvatar = `https://ui-avatars.com/api/?background=1f2a3a&color=5f9eff&bold=true&size=150&name=${encodeURIComponent(member.name?.charAt(0) || '?')}`;
            img.src = (member.photoUrl && member.photoUrl.trim() !== "") ? member.photoUrl : defaultAvatar;
            img.alt = member.name;
            img.className = 'student-img';
            img.onerror = function () {
                this.src = `https://ui-avatars.com/api/?background=132235&color=8bbaff&bold=true&size=150&name=${encodeURIComponent(member.name?.charAt(0) || '?')}`;
            };
            studentImagesContainer.appendChild(img);
            imageElements.push(img);
        });

        if (imageElements.length > 0) {
            currentIndex = 0;
            showMemberByIndex(0);
            updateInfoPanel(0);
        }
    }

    function showMemberByIndex(index) {
        if (!imageElements.length) return;
        imageElements.forEach(img => img.classList.remove('visible'));
        const targetImg = imageElements[index];
        if (targetImg) targetImg.classList.add('visible');
    }

    function updateInfoPanel(index) {
        const member = currentMembers[index];
        if (!member) return;
        learnerSpan.innerText = member.name;

        if (member.role === "staff" && (member.points === null || member.points === undefined)) {
            pointsValueSpan.innerText = "STAFF";
            pointsValueSpan.parentElement.classList.add('staff-badge');
        } else {
            const pts = member.points !== undefined && member.points !== null ? member.points : 0;
            pointsValueSpan.innerText = pts;
            if (member.role === "staff") pointsValueSpan.parentElement.classList.add('staff-badge');
            else pointsValueSpan.parentElement.classList.remove('staff-badge');
        }

        if (member.role === "staff") {
            roleDisplaySpan.innerHTML = "⚜️ STAFF · MENTOR";
            roleDisplaySpan.classList.add("bg-blue-900/60", "text-blue-200");
            roleDisplaySpan.classList.remove("bg-[#2d4670]");
        } else {
            roleDisplaySpan.innerHTML = "🎓 LEARNER";
            roleDisplaySpan.classList.remove("bg-blue-900/60", "text-blue-200");
            roleDisplaySpan.classList.add("bg-[#2d4670]");
        }
    }

    function rotateToNext() {
        if (!currentMembers.length) return;
        currentIndex = (currentIndex + 1) % currentMembers.length;
        showMemberByIndex(currentIndex);
        updateInfoPanel(currentIndex);
    }

    function startRotation() {
        if (rotationInterval) clearInterval(rotationInterval);
        if (currentMembers.length) {
            currentIndex = 0;
            showMemberByIndex(0);
            updateInfoPanel(0);
            rotationInterval = setInterval(() => {
                if (!isExpired()) {
                    rotateToNext();
                }
            }, 3200);
        }
    }

    function stopRotation() {
        if (rotationInterval) {
            clearInterval(rotationInterval);
            rotationInterval = null;
        }
    }

    function goBackToClasses() {
        stopRotation();
        selectionScreen.classList.remove('hidden');
        galleryScreen.classList.add('hidden');
        backToClassesBtn.classList.add('hidden');
        finalUI.classList.add('hidden');
        classBadgeSpan.innerHTML = `📚 ${allClasses.length} Classes · Safi Campus`;
        classFooterSpan.innerText = "Select a class";
        memberCountSpan.innerText = "0 members";
    }

    // Countdown logic
    function formatTwo(n) { return n < 10 ? '0' + n : n; }
    function isExpired() { return Date.now() >= targetDate.getTime(); }

    function updateNumbersAndMaybeFinal() {
        if (isExpired()) {
            showFinalScreen();
            return true;
        }
        const diff = targetDate - Date.now();
        daysSpan.innerText = formatTwo(Math.floor(diff / 86400000));
        hoursSpan.innerText = formatTwo(Math.floor((diff % 86400000) / 3600000));
        minutesSpan.innerText = formatTwo(Math.floor((diff % 3600000) / 60000));
        secondsSpan.innerText = formatTwo(Math.floor((diff % 60000) / 1000));
        return false;
    }

    function showFinalScreen() {
        if (galleryScreen.classList.contains('hidden')) return;
        galleryScreen.classList.add('hidden');
        finalUI.classList.remove('hidden');
        finalUI.innerHTML = `
          <div class="final-elegant">
            <span class="text-7xl block mb-5">🌑</span>
            <h2 class="text-5xl md:text-7xl font-bold text-white">Fil Noir</h2>
            <p class="text-3xl text-blue-400 mt-2">ARRIVED</p>
            <p class="text-gray-400 mt-6 text-xl border-t border-blue-900/50 pt-6">may 5, 2026 · the moment is now</p>
            <div class="mt-8 text-blue-300/50 text-sm tracking-widest">Points sealed · Class Gallery</div>
            <button id="backFromFinalBtn" class="mt-6 btn-primary text-sm">← Back to Classes</button>
          </div>
        `;
        document.getElementById('backFromFinalBtn')?.addEventListener('click', () => {
            finalUI.classList.add('hidden');
            selectionScreen.classList.remove('hidden');
            backToClassesBtn.classList.add('hidden');
            classBadgeSpan.innerHTML = `📚 ${allClasses.length} Classes · Safi Campus`;
        });
        if (rotationInterval) clearInterval(rotationInterval);
        if (timerInterval) clearInterval(timerInterval);
    }

    function calculateSeasonPercentage() {
        const now = Date.now();
        if (now <= seasonStart.getTime()) return 0;
        if (now >= seasonEnd.getTime()) return 100;
        const total = seasonEnd.getTime() - seasonStart.getTime();
        const elapsed = now - seasonStart.getTime();
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    }

    function updateProgressCircle() {
        const percentage = calculateSeasonPercentage();
        const dashLength = (percentage / 100) * circumference;
        progressFill.setAttribute('stroke-dasharray', `${dashLength}, ${circumference}`);
        progressPercentage.innerText = Math.floor(percentage);
    }

    // Event Listeners
    backToClassesBtn.addEventListener('click', goBackToClasses);

    async function init() {
        await fetchAllClasses();

        updateProgressCircle();

        timerInterval = setInterval(() => {
            if (isExpired()) {
                if (timerInterval) clearInterval(timerInterval);
                if (rotationInterval) clearInterval(rotationInterval);
                showFinalScreen();
            } else {
                updateNumbersAndMaybeFinal();
                updateProgressCircle();
            }
        }, 1000);
    }

    init();
})();