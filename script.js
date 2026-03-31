
(function () {
    // ---------- DATES ----------
    const targetDate = new Date(2026, 4, 5, 0, 0, 0);
    const seasonStart = new Date(2025, 9, 7, 0, 0, 0);
    const seasonEnd = new Date(2026, 4, 5, 0, 0, 0);

    const mainDiv = document.getElementById('mainUI');
    const finalDiv = document.getElementById('finalUI');
    const daysSpan = document.getElementById('days');
    const hoursSpan = document.getElementById('hours');
    const minutesSpan = document.getElementById('minutes');
    const secondsSpan = document.getElementById('seconds');
    const learnerSpan = document.getElementById('learnerMessage');
    const pointsValueSpan = document.getElementById('pointsValue');
    const roleDisplaySpan = document.getElementById('roleDisplay');
    const studentImagesContainer = document.getElementById('studentImagesContainer');
    const classBadgeSpan = document.getElementById('classBadge');
    const classFooterSpan = document.getElementById('classFooterSpan');
    const memberCountSpan = document.getElementById('memberCountSpan');

    const progressFill = document.getElementById('progressFill');
    const progressPercentage = document.getElementById('progressPercentage');
    const circumference = 2 * Math.PI * 45;

    // Unified array: each person = { name, photoUrl, points, role, username? }
    let allMembers = [];        // students + staff combined
    let currentIndex = 0;
    let imageElements = [];
    let rotationInterval = null;
    let timerInterval = null;

    function buildPhotoUrl(photoPath) {
        if (!photoPath) return null;
        if (photoPath.startsWith('http://') || photoPath.startsWith('https://') || photoPath.startsWith('//')) {
            return photoPath;
        }
        // if photo is just filename, use intranet base
        return `https://intranet.youcode.ma/storage/users/profile/${photoPath}`;
    }

    async function fetchClassData() {
        try {
            const apiUrl = "https://youcode-extranet-production.up.railway.app/api/classes/GryffindorElites?_v=11";
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const jsonData = await response.json();
            const classInfo = jsonData.class;
            if (!classInfo) throw new Error("Invalid API structure");

            const className = classInfo.name || "GryffindorElites";
            const campusName = classInfo.campus?.name || "Safi";
            const levelName = classInfo.level?.name || "1st Year";
            classBadgeSpan.innerHTML = `${className} · ${campusName} · ${levelName}`;
            classFooterSpan.innerText = className;

            // Process STUDENTS (with points)
            const rawStudents = classInfo.students || [];
            const studentsList = rawStudents.map(s => ({
                name: s.name || "Anonymous",
                photoUrl: s.photo ? buildPhotoUrl(s.photo) : null,
                points: s.points !== undefined && s.points !== null ? s.points : 0,
                role: "student",
                pointsVariation: s.pointsVariation || 0
            }));

            // Process STAFF (staff array from API)
            const rawStaff = classInfo.staff || [];
            const staffList = rawStaff.map(st => ({
                name: st.name || "Staff Member",
                photoUrl: st.photo ? buildPhotoUrl(st.photo) : null,
                points: st.points !== undefined && st.points !== null ? st.points : null,
                role: "staff",
                pointsVariation: st.pointsVariation || 0
            }));

            // Combine: staff first (mentors/leaders) then students, but keep order for gallery
            allMembers = [...staffList, ...studentsList];

            if (allMembers.length === 0) {
                // fallback in case of empty API
                allMembers = [{ name: "Gryffindor Elite", photoUrl: null, points: 0, role: "student" }];
            }

            // update footer count
            memberCountSpan.innerText = `${allMembers.length} members (${staffList.length} staff, ${studentsList.length} students)`;

            buildGalleryFromMembers();
            startRotation();
            return true;
        } catch (err) {
            console.error("API fetch error:", err);
            classBadgeSpan.innerHTML = `GryffindorElites · Live mode (fallback)`;
            // fallback data containing staff + students with points (based on previous structure but enriched)
            allMembers = [
                { name: "Prof. Mohamed Yassine Bahajou", photoUrl: "https://intranet.youcode.ma/storage/users/profile/28-1665941748.jpg", points: 1250, role: "staff" },
                { name: "Khadija Abirat", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1519-1760996184.png", points: 447, role: "LEARNER" },
                { name: "Yassin Maftah", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1877-1760996507.png", points: 438, role: "LEARNER" },
                { name: "Zakarya Hari", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1684-1760996356.png", points: 434, role: "LEARNER" },
                { name: "Nourelhouda Tajat", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1680-1760996352.png", points: 411, role: "LEARNER" },
                { name: "Mohammed Mehdi Saibat", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1733-1760996421.png", points: 397, role: "LEARNER" },
                { name: "Oussama Kara", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1531-1760996202.png", points: 388, role: "LEARNER" },
                { name: "Salma Jaddar", photoUrl: "https://intranet.youcode.ma/storage/users/profile/2044-1760996596.png", points: 338, role: "LEARNER" },
                { name: "Larbi Loubi", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1779-1760996465.png", points: 337, role: "LEARNER" },
                { name: "Ilias El Garch", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1657-1760996328.png", points: 320, role: "LEARNER" },
                { name: "ahmed oubelkacem", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1662-1760996330.png", points: 314, role: "LEARNER" },
                { name: "Sahhouti Amine", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1550-1760996249.png", points: 312, role: "LEARNER" },
                { name: "Ilyas Bahsi", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1452-1760996174.png", points: 263, role: "LEARNER" },
                { name: "Adnane Qnais", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1895-1760996530.png", points: 259, role: "LEARNER" },
                { name: "Rihab Sabri", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1671-1760996340.png", points: 250, role: "LEARNER" },
                { name: "Zakaria Dachi", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1738-1760996428.png", points: 230, role: "LEARNER" },
                { name: "Ayoub Elkhadir", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1727-1760996409.png", points: 221, role: "LEARNER" },
                { name: "Noha Kasmi", photoUrl: "https://intranet.youcode.ma/storage/users/profile/1866-1760996491.png", points: 86 }
            ];
            buildGalleryFromMembers();
            startRotation();
            return false;
        }
    }

    function buildGalleryFromMembers() {
        studentImagesContainer.innerHTML = '';
        imageElements = [];

        if (!allMembers.length) return;

        allMembers.forEach((member, idx) => {
            const img = document.createElement('img');
            img.id = `member_img_${idx}`;
            const defaultAvatar = `https://ui-avatars.com/api/?background=1f2a3a&color=5f9eff&bold=true&size=150&name=${encodeURIComponent(member.name.charAt(0))}`;
            img.src = (member.photoUrl && member.photoUrl.trim() !== "") ? member.photoUrl : defaultAvatar;
            img.alt = member.name;
            img.className = 'student-img';
            img.setAttribute('data-member-idx', idx);
            img.onerror = function () {
                this.src = `https://ui-avatars.com/api/?background=132235&color=8bbaff&bold=true&size=150&name=${encodeURIComponent(member.name?.charAt(0) || '?')}`;
            };
            studentImagesContainer.appendChild(img);
            imageElements.push(img);
        });

        if (imageElements.length > 0) {
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
        const member = allMembers[index];
        if (!member) return;
        learnerSpan.innerText = member.name;

        // points display: staff might have null points, treat as "—"
        if (member.role === "staff" && (member.points === null || member.points === undefined)) {
            pointsValueSpan.innerText = "STAFF";
            pointsValueSpan.parentElement.style.opacity = "0.8";
        } else {
            const pts = member.points !== undefined && member.points !== null ? member.points : 0;
            pointsValueSpan.innerText = pts;
            pointsValueSpan.parentElement.style.opacity = "1";
        }

        // role display with style
        if (member.role === "staff") {
            roleDisplaySpan.innerHTML = "⚜️ STAFF · MENTOR";
            roleDisplaySpan.classList.add("bg-blue-900/60", "text-blue-200");
            roleDisplaySpan.classList.remove("bg-[#2d4670]");
            document.querySelector('.points-badge')?.classList.add('staff-badge');
        } else {
            roleDisplaySpan.innerHTML = "🎓 LEARNER";
            roleDisplaySpan.classList.remove("bg-blue-900/60", "text-blue-200");
            roleDisplaySpan.classList.add("bg-[#2d4670]");
            document.querySelector('.points-badge')?.classList.remove('staff-badge');
        }
    }

    function rotateToNext() {
        if (!allMembers.length) return;
        currentIndex = (currentIndex + 1) % allMembers.length;
        showMemberByIndex(currentIndex);
        updateInfoPanel(currentIndex);
    }

    function startRotation() {
        if (rotationInterval) clearInterval(rotationInterval);
        if (allMembers.length) {
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
        if (mainDiv.classList.contains('hidden')) return;
        mainDiv.classList.add('hidden');
        finalDiv.classList.remove('hidden');
        finalDiv.innerHTML = `
          <div class="final-elegant">
            <span class="text-7xl block mb-5">🌑</span>
            <h2 class="text-5xl md:text-7xl font-bold text-white">Fil Noir</h2>
            <p class="text-3xl text-blue-400 mt-2">ARRIVED</p>
            <p class="text-gray-400 mt-6 text-xl border-t border-blue-900/50 pt-6">may 5, 2026 · the moment is now</p>
            <div class="mt-8 text-blue-300/50 text-sm tracking-widest">GryffindorElites · Points sealed</div>
          </div>
        `;
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

    async function init() {
        await fetchClassData();   // builds allMembers (staff+students) and gallery

        updateProgressCircle();
        if (isExpired()) {
            showFinalScreen();
            return;
        }

        updateNumbersAndMaybeFinal();
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

        // ensure rotation is active (in case fetchClassData didn't start due to empty but fallback exists)
        if (!rotationInterval && allMembers.length) startRotation();
    }

    init();
})();