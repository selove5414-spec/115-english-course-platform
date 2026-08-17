/**
 * 115學年度高中英文課務協作平台 - 核心邏輯 (app.js)
 * 最新修訂說明：採用全域事件委派 (Event Delegation) 確保側邊欄與頂部選單 100% 點擊流暢切換。
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // Application State
  // --------------------------------------------------------------------------
  const state = {
    currentUser: null,
    teachers: loadStorage('115_english_teachers', window.INITIAL_TEACHERS || []),
    tasks: loadStorage('115_english_tasks', window.INITIAL_TASKS || []),
    roster: loadStorage('115_english_roster', window.COURSE_ASSIGNMENTS || { grades: [] }),
    examSetters: loadStorage('115_english_exam_setters', window.INITIAL_EXAM_SETTERS || []),
    examSpecs: loadStorage('115_english_exam_specs', window.INITIAL_EXAM_SPECS || []),
    activeView: 'timeline',
    searchQuery: '',
    gradeFilter: 'all',
    onlyMine: false
  };

  // Pre-login as Department Head (何妃卿 老師)
  if (state.teachers && state.teachers.length > 0) {
    state.currentUser = state.teachers.find(t => t.id === 'ho_fei_ching') || state.teachers[0];
  }

  // --------------------------------------------------------------------------
  // LocalStorage Helpers
  // --------------------------------------------------------------------------
  function loadStorage(key, fallback) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.warn('LocalStorage error:', e);
      return fallback;
    }
  }

  function saveStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage save error:', e);
    }
  }

  // --------------------------------------------------------------------------
  // DOM Elements
  // --------------------------------------------------------------------------
  const elements = {
    mainWrapper: document.getElementById('mainWrapper'),
    sections: document.querySelectorAll('.view-section'),
    sidebarUserName: document.getElementById('sidebarUserName'),
    sidebarUserRole: document.getElementById('sidebarUserRole'),
    sidebarAvatar: document.getElementById('sidebarAvatar'),
    btnSwitchUser: document.getElementById('btnSwitchUser'),
    navAdminItem: document.getElementById('navAdminItem'),
    taskCountBadge: document.getElementById('taskCountBadge'),
    
    // Controls
    searchInput: document.getElementById('searchInput'),
    gradeFilterSelect: document.getElementById('gradeFilterSelect'),
    btnExportData: document.getElementById('btnExportData'),
    btnResetData: document.getElementById('btnResetData'),
    btnNewTask: document.getElementById('btnNewTask'),
    btnCoeditNewTask: document.getElementById('btnCoeditNewTask'),
    btnFilterMyTasks: document.getElementById('btnFilterMyTasks'),
    btnFilterOnlyMine: document.getElementById('btnFilterOnlyMine'),
    btnAutoDistributeSetters: document.getElementById('btnAutoDistributeSetters'),
    coeditCurrentUserName: document.getElementById('coeditCurrentUserName'),
    
    // Notion Sync
    btnCopyNotionMarkdown: document.getElementById('btnCopyNotionMarkdown'),
    notionMarkdownPreview: document.getElementById('notionMarkdownPreview'),

    // View Content Containers
    timelineContent: document.getElementById('timelineContent'),
    rosterContent: document.getElementById('rosterContent'),
    settersTbody: document.getElementById('settersTbody'),
    specsContent: document.getElementById('specsContent'),
    magazinesContent: document.getElementById('magazinesContent'),
    memoContent: document.getElementById('memoContent'),
    rubricsContent: document.getElementById('rubricsContent'),
    templateTheadRow: document.getElementById('templateTheadRow'),
    templateTbody: document.getElementById('templateTbody'),
    tasksList: document.getElementById('tasksList'),
    adminTeacherAccountList: document.getElementById('adminTeacherAccountList'),
    
    // Universal Detail Modal
    detailModal: document.getElementById('detailModal'),
    detailModalTitle: document.getElementById('detailModalTitle'),
    detailModalBody: document.getElementById('detailModalBody'),
    btnCloseDetailModal: document.getElementById('btnCloseDetailModal'),
    btnDetailClose: document.getElementById('btnDetailClose'),

    // Login Modal
    loginModal: document.getElementById('loginModal'),
    btnCloseLoginModal: document.getElementById('btnCloseLoginModal'),
    loginForm: document.getElementById('loginForm'),
    loginUsername: document.getElementById('loginUsername'),
    loginPassword: document.getElementById('loginPassword'),
    quickUsersContainer: document.getElementById('quickUsersContainer'),
    
    // Edit Setter Modal
    editSetterModal: document.getElementById('editSetterModal'),
    btnCloseSetterModal: document.getElementById('btnCloseSetterModal'),
    editSetterForm: document.getElementById('editSetterForm'),
    setterFormId: document.getElementById('setterFormId'),
    setterFormGradeSubject: document.getElementById('setterFormGradeSubject'),
    setterFormExam1Teacher: document.getElementById('setterFormExam1Teacher'),
    setterFormScope1: document.getElementById('setterFormScope1'),
    setterFormExam2Teacher: document.getElementById('setterFormExam2Teacher'),
    setterFormScope2: document.getElementById('setterFormScope2'),
    setterFormFinalExamTeacher: document.getElementById('setterFormFinalExamTeacher'),
    setterFormFinalScope: document.getElementById('setterFormFinalScope'),
    
    // Task Modal
    taskModal: document.getElementById('taskModal'),
    taskModalTitle: document.getElementById('taskModalTitle'),
    btnCloseTaskModal: document.getElementById('btnCloseTaskModal'),
    taskForm: document.getElementById('taskForm'),
    taskFormId: document.getElementById('taskFormId'),
    taskFormTitle: document.getElementById('taskFormTitle'),
    taskFormAssignee: document.getElementById('taskFormAssignee'),
    taskFormGrade: document.getElementById('taskFormGrade'),
    taskFormSubject: document.getElementById('taskFormSubject'),
    taskFormDueDate: document.getElementById('taskFormDueDate'),
    taskFormNote: document.getElementById('taskFormNote'),
    
    adminSelectCourse: document.getElementById('adminSelectCourse'),
    adminSelectTeacher: document.getElementById('adminSelectTeacher'),
    btnAdminUpdateTeacher: document.getElementById('btnAdminUpdateTeacher'),
    
    toast: document.getElementById('toast')
  };

  // --------------------------------------------------------------------------
  // Initialization & View Controller
  // --------------------------------------------------------------------------
  function init() {
    updateUserProfileUI();
    renderQuickUsers();
    renderAllViews();
    bindEvents();

    // Initial view from Hash or default timeline
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`sec-${hash}`)) {
      switchView(hash);
    } else {
      switchView('timeline');
    }
  }

  function showToast(msg) {
    elements.toast.textContent = msg;
    elements.toast.classList.add('active');
    setTimeout(() => {
      elements.toast.classList.remove('active');
    }, 2500);
  }

  function updateUserProfileUI() {
    if (state.currentUser) {
      elements.sidebarUserName.textContent = state.currentUser.name;
      elements.sidebarAvatar.textContent = state.currentUser.avatar || '👩‍🏫';
      elements.sidebarUserRole.textContent = state.currentUser.role === 'admin' ? '英文科負責人' : '科務教師';
      elements.sidebarUserRole.style.color = state.currentUser.role === 'admin' ? 'var(--accent-red)' : 'var(--primary-hover)';
      elements.coeditCurrentUserName.textContent = state.currentUser.name;

      if (state.currentUser.role === 'admin') {
        elements.navAdminItem.style.display = 'flex';
      } else {
        elements.navAdminItem.style.display = 'none';
        if (state.activeView === 'admin') {
          switchView('timeline');
        }
      }
    }
    elements.taskCountBadge.textContent = state.tasks.length;
  }

  function renderQuickUsers() {
    elements.quickUsersContainer.innerHTML = state.teachers.map(t => `
      <div class="quick-user-chip" data-id="${t.id}">
        ${t.avatar} ${t.name} (${t.role === 'admin' ? '科負責人' : t.username})
      </div>
    `).join('');

    elements.quickUsersContainer.querySelectorAll('.quick-user-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const tid = chip.getAttribute('data-id');
        const user = state.teachers.find(t => t.id === tid);
        if (user) {
          state.currentUser = user;
          updateUserProfileUI();
          renderTasks();
          renderAdmin();
          elements.loginModal.classList.remove('active');
          showToast(`已切換身份為：${user.name}`);
        }
      });
    });
  }

  // 100% Fail-Proof View Switcher Engine
  function switchView(viewName) {
    if (!viewName || !document.getElementById(`sec-${viewName}`)) return;

    state.activeView = viewName;
    
    // Smoothly update Hash without forced page reload
    if (window.location.hash !== `#${viewName}`) {
      history.pushState(null, '', `#${viewName}`);
    }

    // Update sidebar nav active states
    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update top header quick switcher buttons
    document.querySelectorAll('#headerQuickNav [data-nav]').forEach(btn => {
      if (btn.getAttribute('data-nav') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update section active & inline display styles
    document.querySelectorAll('.view-section').forEach(sec => {
      if (sec.id === `sec-${viewName}`) {
        sec.classList.add('active');
        sec.style.display = 'block';
      } else {
        sec.classList.remove('active');
        sec.style.display = 'none';
      }
    });

    if (elements.mainWrapper) {
      elements.mainWrapper.scrollTop = 0;
    }
  }

  function openDetailModal(title, contentHtml) {
    elements.detailModalTitle.textContent = title;
    elements.detailModalBody.innerHTML = contentHtml;
    elements.detailModal.style.display = 'flex';
    elements.detailModal.classList.add('active');
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
      modal.style.display = 'none';
    });
  }

  function renderAllViews() {
    renderTimeline();
    renderRoster();
    renderSetters();
    renderSpecs();
    renderMagazines();
    renderMemo();
    renderRubrics();
    renderTemplate();
    renderNotionPreview();
    renderTasks();
    renderAdmin();
  }

  // --------------------------------------------------------------------------
  // 1. 115(1) 行事曆時間線 Renderer (可「點進去看」詳細資訊)
  // --------------------------------------------------------------------------
  function renderTimeline() {
    let html = '';
    TIMELINE_DATA.forEach(sem => {
      html += `<div style="margin-bottom: 24px;"><h2 style="font-size: 1.4rem; font-weight: 800; color: var(--primary-hover); margin-bottom: 16px;">📌 ${sem.semester}</h2>`;
      
      sem.months.forEach(m => {
        const events = m.events.filter(e => {
          const matchQuery = !state.searchQuery || 
            e.title.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
            e.desc.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            e.inCharge.toLowerCase().includes(state.searchQuery.toLowerCase());
          return matchQuery;
        });

        if (events.length === 0 && state.searchQuery) return;

        html += `
          <div class="month-block">
            <div class="month-title">📅 ${m.month}</div>
            <div class="timeline-events-list">
        `;

        events.forEach((e, idx) => {
          const typeClass = `type-${e.type || 'prep'}`;
          html += `
            <div class="event-card" style="cursor:pointer;" data-action="click-event" data-month="${m.month}" data-idx="${idx}">
              <div class="event-node"></div>
              <div class="event-header">
                <span class="event-date">${e.date}</span>
                <span class="event-type-badge ${typeClass}">${getTypeLabel(e.type)}</span>
              </div>
              <div class="event-title">${e.title}</div>
              <div class="event-desc">${e.desc}</div>
              <div class="event-incharge">👤 負責對象 / 老師：<strong>${e.inCharge}</strong> <span style="margin-left:auto; color:var(--primary-hover); font-weight:600;">🔍 點擊查看詳細 ➔</span></div>
            </div>
          `;
        });

        html += `</div></div>`;
      });

      html += `</div>`;
    });

    elements.timelineContent.innerHTML = html || `<div style="text-align:center; padding: 40px; color: var(--text-muted);">無符合條件的行事曆項目</div>`;

    // Click into timeline detail
    elements.timelineContent.querySelectorAll('[data-action="click-event"]').forEach(card => {
      card.addEventListener('click', () => {
        const monthName = card.getAttribute('data-month');
        const eventIdx = parseInt(card.getAttribute('data-idx'), 10);
        
        let foundEvent = null;
        TIMELINE_DATA.forEach(sem => {
          sem.months.forEach(m => {
            if (m.month === monthName && m.events[eventIdx]) {
              foundEvent = m.events[eventIdx];
            }
          });
        });

        if (foundEvent) {
          openDetailModal(`📅 日程詳細資料：${foundEvent.title}`, `
            <div style="font-size:0.95rem; line-height:1.8;">
              <div style="margin-bottom:12px;"><span class="event-date">${foundEvent.date}</span> <span class="event-type-badge type-${foundEvent.type}">${getTypeLabel(foundEvent.type)}</span></div>
              <div style="font-size:1.1rem; font-weight:800; color:var(--text-main); margin-bottom:10px;">${foundEvent.title}</div>
              <div style="background:var(--bg-color); padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:14px;">
                ${foundEvent.desc}
              </div>
              <div>👤 <strong>主辦/負責對象：</strong> ${foundEvent.inCharge}</div>
              <div style="margin-top:16px; border-top:1px solid var(--border-color); padding-top:12px; color:var(--text-muted); font-size:0.85rem;">
                💡 提示：如需針對此日程新增個人追蹤或科務大卷工作，可點擊上方選單的「➕ 新增課務事項」。
              </div>
            </div>
          `);
        }
      });
    });
  }

  function getTypeLabel(type) {
    const map = {
      exam: '🚨 段考筆試',
      audio_exam: '🎧 聽力段考',
      exam_prep: '📝 進度大卷',
      holiday: '🌴 連假放假',
      start: '🎒 開學備課',
      activity: '🏆 校園活動',
      makeup: '🎯 補考/重補修'
    };
    return map[type] || '📌 課務項目';
  }

  // --------------------------------------------------------------------------
  // 2. 任課與授課統計 Renderer (可「點進去看」詳細資訊)
  // --------------------------------------------------------------------------
  function renderRoster() {
    const data = state.roster;
    let html = '';

    data.grades.forEach(g => {
      if (state.gradeFilter !== 'all' && g.grade !== state.gradeFilter) return;

      html += `
        <div class="roster-card">
          <div class="roster-card-header">
            <span class="icon">🏫</span>
            <h3>${g.grade}</h3>
          </div>
      `;

      g.sections.forEach(sec => {
        html += `<div style="font-weight:700; font-size:0.88rem; color:var(--text-muted); margin: 12px 0 6px;">${sec.subject}</div><div class="subject-item-list">`;
        sec.items.forEach(item => {
          html += `
            <div class="subject-row" style="cursor:pointer;" data-action="click-roster-item" data-grade="${g.grade}" data-name="${item.name}" data-teacher="${item.teacher}">
              <span class="subject-name">${item.name}</span>
              <span class="teacher-badge">👩‍🏫 ${item.teacher}</span>
            </div>
          `;
        });
        html += `</div>`;
      });

      html += `</div>`;
    });

    elements.rosterContent.innerHTML = html;

    elements.rosterContent.querySelectorAll('[data-action="click-roster-item"]').forEach(row => {
      row.addEventListener('click', () => {
        const grade = row.getAttribute('data-grade');
        const name = row.getAttribute('data-name');
        const teacher = row.getAttribute('data-teacher');

        openDetailModal(`🏫 班級授課資訊：${name}`, `
          <div style="font-size:0.95rem; line-height:1.8;">
            <div><strong>所屬年級 / 類別：</strong>${grade}</div>
            <div><strong>班級 / 科目名稱：</strong><span style="color:var(--accent-blue); font-weight:700;">${name}</span></div>
            <div><strong>115學年度任課老師：</strong><span class="teacher-badge" style="display:inline-flex;">👩‍🏫 ${teacher}</span></div>
            <div style="margin-top:14px; background:var(--primary-light); padding:12px; border-radius:var(--radius-sm); color:var(--primary-hover); font-size:0.88rem;">
              💡 提示：如需更換此班級的任課老師，科負責人可前往「主要編輯者後台」進行線上更換。
            </div>
          </div>
        `);
      });
    });
  }

  // --------------------------------------------------------------------------
  // 3. 段考出題分配與範圍 Renderer
  // --------------------------------------------------------------------------
  function renderSetters() {
    elements.settersTbody.innerHTML = state.examSetters.map(row => `
      <tr style="cursor:pointer;" data-action="click-setter-row" data-id="${row.id}">
        <td><strong>${row.grade} ${row.subject}</strong></td>
        <td><span class="setter-tag">${row.exam1}</span></td>
        <td style="font-size:0.82rem; color:var(--text-muted);">${row.scope1 || '<em style="color:#d9730d;">（點擊線上填寫）</em>'}</td>
        <td><span class="setter-tag">${row.exam2}</span></td>
        <td style="font-size:0.82rem; color:var(--text-muted);">${row.scope2 || '<em style="color:#d9730d;">（點擊線上填寫）</em>'}</td>
        <td><span class="setter-tag">${row.finalExam}</span></td>
        <td style="font-size:0.82rem; color:var(--text-muted);">${row.finalScope || '<em style="color:#d9730d;">（點擊線上填寫）</em>'}</td>
        <td>
          <button class="btn-sm btn-edit-sm" data-action="edit-setter" data-id="${row.id}">✏️ 編輯出題與範圍</button>
        </td>
      </tr>
    `).join('');

    elements.settersTbody.querySelectorAll('[data-action="edit-setter"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        openSetterModal(id);
      });
    });

    elements.settersTbody.querySelectorAll('[data-action="click-setter-row"]').forEach(tr => {
      tr.addEventListener('click', () => {
        const id = tr.getAttribute('data-id');
        openSetterModal(id);
      });
    });
  }

  function autoDistributeExamSetters() {
    state.examSetters = [
      { id: 'es_1', grade: '普高一年級', subject: '英文', exam1: '林天宜 老師', scope1: state.examSetters[0]?.scope1 || '', exam2: '何妃卿 老師', scope2: state.examSetters[0]?.scope2 || '', finalExam: '蔡欣妤 老師', finalScope: state.examSetters[0]?.finalScope || '' },
      { id: 'es_2', grade: '普高一年級', subject: '英聽', exam1: '陳文宗 老師', scope1: state.examSetters[1]?.scope1 || '', exam2: '陳文宗 老師', scope2: state.examSetters[1]?.scope2 || '', finalExam: '陳文宗 老師', finalScope: state.examSetters[1]?.finalScope || '' },
      { id: 'es_3', grade: '普高二年級', subject: '英文', exam1: '何妃卿 老師', scope1: state.examSetters[2]?.scope1 || '', exam2: '陳文宗 老師', scope2: state.examSetters[2]?.scope2 || '', finalExam: '何妃卿 老師', finalScope: state.examSetters[2]?.finalScope || '' },
      { id: 'es_4', grade: '普高二年級', subject: '英閱寫作', exam1: '何妃卿 老師', scope1: state.examSetters[3]?.scope1 || '', exam2: '何妃卿 老師', scope2: state.examSetters[3]?.scope2 || '', finalExam: '何妃卿 老師', finalScope: state.examSetters[3]?.finalScope || '' },
      { id: 'es_5', grade: '普高三年級', subject: '英文', exam1: '顏惠玲 老師', scope1: state.examSetters[4]?.scope1 || '', exam2: '蔡欣妤 老師', scope2: state.examSetters[4]?.scope2 || '', finalExam: '何妃卿 老師', finalScope: state.examSetters[4]?.finalScope || '' },
      { id: 'es_6', grade: '普高三年級', subject: '英作', exam1: '蔡欣妤 老師', scope1: state.examSetters[5]?.scope1 || '', exam2: '何妃卿 老師', scope2: state.examSetters[5]?.scope2 || '', finalExam: '顏惠玲 老師', finalScope: state.examSetters[5]?.finalScope || '' }
    ];

    saveStorage('115_english_exam_setters', state.examSetters);
    renderSetters();
    showToast('已依據 115 授課班級完成段考出題老師平均分配！');
  }

  // --------------------------------------------------------------------------
  // 4. 段考題型與範圍線上更新區 Renderer (可「點進去看」)
  // --------------------------------------------------------------------------
  function renderSpecs() {
    elements.specsContent.innerHTML = state.examSpecs.map(spec => `
      <div class="spec-card" style="cursor:pointer;" data-action="click-spec-card" data-id="${spec.id}">
        <div class="spec-header">
          <div class="spec-title">${spec.examTitle}</div>
          <span class="event-type-badge type-exam">出題老師：${spec.setter}</span>
        </div>

        <div class="spec-scope-box" style="${!spec.scope ? 'background:#fef2f2; border-color:#ef4444; color:#991b1b;' : ''}">
          <strong>📚 考試範圍：</strong> ${spec.scope || '⚠️ （目前尚未填寫，等待出題老師線上更新）'}
        </div>

        <div class="spec-section-box">
          <h4>配分與注意事項說明</h4>
          <p style="font-size:0.88rem; color:var(--text-muted);">${spec.formatNotes || '無特殊說明。'}</p>
        </div>

        <div style="margin-top:14px; text-align:right;">
          <button class="btn-sm btn-edit-sm" data-action="update-spec-scope" data-id="${spec.id}">✏️ 修改出題範圍與題型</button>
        </div>
      </div>
    `).join('');

    elements.specsContent.querySelectorAll('[data-action="update-spec-scope"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const sid = btn.getAttribute('data-id');
        const spec = state.examSpecs.find(s => s.id === sid);
        if (spec) {
          const newScope = prompt(`請輸入「${spec.examTitle}」的段考範圍：`, spec.scope || '');
          if (newScope !== null) {
            spec.scope = newScope.trim();
            saveStorage('115_english_exam_specs', state.examSpecs);
            renderSpecs();
            showToast('已成功更新段考範圍！');
          }
        }
      });
    });

    elements.specsContent.querySelectorAll('[data-action="click-spec-card"]').forEach(card => {
      card.addEventListener('click', () => {
        const sid = card.getAttribute('data-id');
        const spec = state.examSpecs.find(s => s.id === sid);
        if (spec) {
          openDetailModal(`📋 ${spec.examTitle} 詳細內容`, `
            <div style="font-size:0.95rem; line-height:1.8;">
              <div><strong>適用年級與科目：</strong>${spec.grade} - ${spec.subject}</div>
              <div><strong>命題與審題老師：</strong><span class="setter-tag">${spec.setter}</span></div>
              <div style="margin:12px 0; background:#fffbeb; border-left:4px solid #f59e0b; padding:12px; border-radius:4px; color:#92400e;">
                <strong>📚 目前出題範圍：</strong><br>${spec.scope || '⚠️ （目前尚未填寫，等待出題老師線上更新）'}
              </div>
              <div><strong>測驗題型與配分說明：</strong></div>
              <div style="background:var(--bg-color); padding:10px 14px; border-radius:var(--radius-sm); font-size:0.88rem;">
                ${spec.formatNotes || '無特殊說明。'}
              </div>
            </div>
          `);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 5. 📖 115學年度書卷雜誌訂購 Renderer (可「點進去看」)
  // --------------------------------------------------------------------------
  function renderMagazines() {
    elements.magazinesContent.innerHTML = MAGAZINES_DATA.map((m, idx) => `
      <div class="roster-card" style="cursor:pointer;" data-action="click-magazine" data-idx="${idx}">
        <div class="roster-card-header">
          <span class="icon">📖</span>
          <h3>${m.grade}</h3>
        </div>
        <div style="font-size:0.88rem; line-height:1.7; color:var(--text-main);">
          <div><strong>出版社與刊物：</strong>${m.publisher}</div>
          <div><strong>訂購月份：</strong><span style="color:var(--accent-blue); font-weight:700;">${m.months}</span></div>
          <div><strong>學生人數：</strong>${m.studentCounts}</div>
          <div style="margin-top:8px; background:var(--badge-amber-bg); padding:8px 12px; border-radius:var(--radius-sm); color:var(--badge-amber-text); font-weight:600;">
            ${m.bonusBooks}
          </div>
          <div style="margin-top:8px; text-align:right; color:var(--primary-hover); font-weight:600; font-size:0.8rem;">🔍 點擊查看完整明細 ➔</div>
        </div>
      </div>
    `).join('');

    elements.magazinesContent.querySelectorAll('[data-action="click-magazine"]').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-idx'), 10);
        const m = MAGAZINES_DATA[idx];
        if (m) {
          openDetailModal(`📖 雜誌與試卷訂購明細：${m.grade}`, `
            <div style="font-size:0.95rem; line-height:1.8;">
              <div><strong>刊物名稱：</strong>${m.publisher}</div>
              <div><strong>訂購期數與月份：</strong><span style="color:var(--accent-blue); font-weight:700;">${m.months}</span></div>
              <div style="margin:10px 0; background:var(--bg-color); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                <strong>學生與試卷人數配送：</strong><br>${m.studentCounts}
              </div>
              <div style="margin-bottom:10px;"><strong>單元卷配發數量：</strong>${m.unitQuizzes}</div>
              <div style="background:var(--badge-amber-bg); padding:10px 14px; border-radius:var(--radius-sm); color:var(--badge-amber-text); font-weight:700;">
                ${m.bonusBooks}
              </div>
            </div>
          `);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. 📝 高中部教學 MEMO Renderer (可「點進去看」)
  // --------------------------------------------------------------------------
  function renderMemo() {
    elements.memoContent.innerHTML = TEACHING_MEMO_DATA.map((memo, idx) => `
      <div class="spec-card" style="cursor:pointer;" data-action="click-memo" data-idx="${idx}">
        <div class="spec-title" style="margin-bottom:12px;">${memo.category} <span style="float:right; font-size:0.8rem; color:var(--primary-hover); font-weight:600;">🔍 點擊展開 ➔</span></div>
        <div class="spec-section-box">
          <ul>
            ${memo.items.map(it => `<li style="font-size:0.95rem; line-height:1.7; margin-bottom:6px;">${it}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');

    elements.memoContent.querySelectorAll('[data-action="click-memo"]').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.getAttribute('data-idx'), 10);
        const memo = TEACHING_MEMO_DATA[idx];
        if (memo) {
          openDetailModal(`📝 教學 MEMO 備忘錄：${memo.category}`, `
            <div style="font-size:0.95rem; line-height:1.8;">
              <div style="font-weight:800; font-size:1.1rem; color:var(--text-main); margin-bottom:12px;">${memo.category}</div>
              <div style="background:var(--bg-color); padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                <ul style="padding-left:20px;">
                  ${memo.items.map(it => `<li style="margin-bottom:8px;">${it}</li>`).join('')}
                </ul>
              </div>
            </div>
          `);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 7. 評量尺規標準 Renderer (可「點進去看」)
  // --------------------------------------------------------------------------
  function renderRubrics() {
    elements.rubricsContent.innerHTML = GRADING_RUBRICS_DATA.map(g => `
      <div class="rubric-card" style="cursor:pointer;" data-action="click-rubric" data-grade="${g.grade}">
        <div class="rubric-title">📊 ${g.grade} <span style="float:right; font-size:0.8rem; color:var(--primary-hover); font-weight:600;">🔍 點擊詳情 ➔</span></div>
        ${g.subjects.map(s => `
          <div class="rubric-subject-box">
            <div class="rubric-subject-name">${s.name}</div>
            <div class="rubric-rate-row">
              <span class="rubric-rate-badge rate-regular">平時分數 ${s.regularRate}</span>
              <span style="font-size:0.82rem; color:var(--text-muted);">${s.regularDetail}</span>
            </div>
            <div class="rubric-rate-row">
              <span class="rubric-rate-badge rate-exam">段考分數 ${s.examRate}</span>
              <span style="font-size:0.82rem; color:var(--text-muted);">${s.examDetail}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');

    elements.rubricsContent.querySelectorAll('[data-action="click-rubric"]').forEach(card => {
      card.addEventListener('click', () => {
        const gradeName = card.getAttribute('data-grade');
        const g = GRADING_RUBRICS_DATA.find(item => item.grade === gradeName);
        if (g) {
          openDetailModal(`📊 評量尺規詳情：${g.grade}`, `
            <div style="font-size:0.95rem; line-height:1.8;">
              <div style="font-weight:800; font-size:1.1rem; margin-bottom:12px;">${g.grade} 評量尺規配分標準</div>
              ${g.subjects.map(s => `
                <div style="background:var(--bg-color); padding:14px; border-radius:var(--radius-sm); border:1px solid var(--border-color); margin-bottom:12px;">
                  <div style="font-weight:700; color:var(--accent-blue); font-size:1rem; margin-bottom:6px;">${s.name}</div>
                  <div><span class="rubric-rate-badge rate-regular">平時 40%</span> ${s.regularDetail}</div>
                  <div style="margin-top:6px;"><span class="rubric-rate-badge rate-exam">段考 60%</span> ${s.examDetail}</div>
                </div>
              `).join('')}
            </div>
          `);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 8. 📄 評量範本 英二A.xlsx Renderer
  // --------------------------------------------------------------------------
  function renderTemplate() {
    const data = RUBRIC_EXCEL_TEMPLATE_DATA;
    elements.templateTheadRow.innerHTML = data.columns.map(c => `<th>${c}</th>`).join('');

    elements.templateTbody.innerHTML = data.sampleRows.map(r => `
      <tr style="cursor:pointer;" data-action="click-template-row" data-name="${r.name}">
        <td><strong>${r.class}</strong></td>
        <td>${r.name}</td>
        <td><code>${r.studentId}</code></td>
        <td>${r.test1}</td>
        <td>${r.test2}</td>
        <td>${r.test3}</td>
        <td><span class="setter-tag">${r.exam1}</span></td>
        <td><span class="setter-tag">${r.exam2}</span></td>
        <td><span class="setter-tag">${r.final}</span></td>
        <td>${r.quiz}</td>
        <td>${r.homework}</td>
        <td>${r.audio}</td>
        <td>${r.classPerf}</td>
        <td><strong style="color:var(--accent-green);">${r.regAvg}</strong></td>
        <td><strong style="color:var(--primary-hover); font-size:0.95rem;">${r.total}</strong></td>
      </tr>
    `).join('');

    elements.templateTbody.querySelectorAll('[data-action="click-template-row"]').forEach(tr => {
      tr.addEventListener('click', () => {
        const studentName = tr.getAttribute('data-name');
        const row = data.sampleRows.find(r => r.name === studentName);
        if (row) {
          openDetailModal(`📄 學生成績計算明細：${row.name}`, `
            <div style="font-size:0.95rem; line-height:1.8;">
              <div><strong>班級：</strong>${row.class} | <strong>姓名：</strong>${row.name} | <strong>學號：</strong><code>${row.studentId}</code></div>
              <div style="margin:12px 0; background:var(--bg-color); padding:12px; border-radius:var(--radius-sm); border:1px solid var(--border-color);">
                <div><strong>大卷成績：</strong>${row.test1}分, ${row.test2}分, ${row.test3}分</div>
                <div><strong>段考成績：</strong>1段(${row.exam1}分), 2段(${row.exam2}分), 期末考(${row.final}分)</div>
                <div><strong>小卷/作業/英聽/課堂：</strong>小卷(${row.quiz}), 作業(${row.homework}), 英聽(${row.audio}), 課堂(${row.classPerf})</div>
              </div>
              <div><strong>平時成績 (40%)：</strong><strong style="color:var(--accent-green); font-size:1.1rem;">${row.regAvg} 分</strong></div>
              <div><strong>學期總成績：</strong><strong style="color:var(--primary-hover); font-size:1.2rem;">${row.total} 分</strong></div>
            </div>
          `);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 9. 📋 Notion 資料同步與預覽 Renderer
  // --------------------------------------------------------------------------
  function renderNotionPreview() {
    const mdText = `# 📚 115學年度 高中英文科務與教學協作平台 (Notion 匯入專用版)

> 👑 英文科負責人：何妃卿 老師
> 🤝 代理負責人：陳文宗 老師
> 🏫 適用學年度：115 學年度 (第一學期 & 第二學期)
> 🌐 Vercel 線上平台：https://115-english-course-platform.vercel.app
> 📦 GitHub 原始碼庫：https://github.com/selove5414-spec/115-english-course-platform

---

## 📅 115(1) 行事曆重點日程 (依 115(1)行事曆_0724.pdf 校對)

- [x] 8/25 (一)：期初教學研究會、第 1 次領域會議（負責：何妃卿 老師 / 陳文宗 老師）
- [x] 8/26 (二)：高一新生始業輔導
- [x] 8/29 (五)：正式上課日、開學典禮、友善校園週宣導
- [ ] 9/8 (一)：全高中部與國中部第八節輔導課開始
- [ ] 9/16 (二) - 9/17 (三)：國九 / 普三 第 1 次學測/會考模擬考
- [ ] 10/6 (一) - 10/8 (三)：🚨 第一次段考（第1次段考筆試測驗）
- [ ] 10/8 (三)：第 2 次領域會議與國中評量研討
- [ ] 10/10 (五)：國慶日連假放假
- [ ] 10/25 (六)：台灣光復節 (10/26 補假)
- [ ] 11/15 (六)：🏆 屏榮高中校慶園遊會 (11/17 補假)
- [ ] 11/26 (三) - 11/28 (五)：🚨 第二次段考（第2次段考筆試測驗）
- [ ] 12/10 (三) - 12/12 (五)：高二公訓露營
- [ ] 1/14 (三)：第八節輔導課最後一日上課
- [ ] 1/15 (四) - 1/16 (五)：🚨 第三次段考 / 期末考筆試測驗
- [ ] 1/17 (六) - 1/19 (一)：🎓 115學年度 大學學科能力測驗 (學測)
- [ ] 1/19 (一)：期末暨期初校務會議 / 期末教學研究會
- [ ] 1/20 (二)：寒假正式開始（辦理寒假補考與重補修）

---

## 📝 115學年度 段考與期末考出題分配表

| 年級 / 科目 | 第 1 次段考 (10/6-10/8) | 第 2 次段考 (11/26-11/28) | 期末考 (1/15-1/16) |
| :--- | :--- | :--- | :--- |
| 普高一年級 英文 | 林天宜 老師 | 何妃卿 老師 | 蔡欣妤 老師 |
| 普高一年級 英聽 | 陳文宗 老師 | 陳文宗 老師 | 陳文宗 老師 |
| 普高二年級 英文 | 何妃卿 老師 | 陳文宗 老師 | 何妃卿 老師 |
| 普高二年級 英閱寫作 | 何妃卿 老師 | 何妃卿 老師 | 何妃卿 老師 |
| 普高三年級 英文 | 顏惠玲 老師 | 蔡欣妤 老師 | 何妃卿 老師 |
| 普高三年級 英作 | 蔡欣妤 老師 | 何妃卿 老師 | 顏惠玲 老師 |
`;

    if (elements.notionMarkdownPreview) {
      elements.notionMarkdownPreview.textContent = mdText;
    }
  }

  // --------------------------------------------------------------------------
  // 10. 科務工作開放共編 Task Renderer
  // --------------------------------------------------------------------------
  function renderTasks() {
    let list = state.tasks;

    if (state.onlyMine && state.currentUser) {
      list = list.filter(t => t.assigneeName.includes(state.currentUser.name.replace(' 老師', '')));
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) || 
        t.assigneeName.toLowerCase().includes(q) ||
        (t.note && t.note.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      elements.tasksList.innerHTML = `<div style="text-align:center; padding: 40px; background:var(--card-bg); border-radius:var(--radius-md); border:1px solid var(--border-color); color:var(--text-muted);">尚無相關科務工作事項</div>`;
      return;
    }

    elements.tasksList.innerHTML = list.map(t => {
      const isDone = t.status === 'completed';
      const isMine = state.currentUser && t.assigneeName.includes(state.currentUser.name.replace(' 老師', ''));
      const isAdmin = state.currentUser && state.currentUser.role === 'admin';
      const canEdit = isMine || isAdmin;

      return `
        <div class="task-card ${isDone ? 'completed' : ''}" id="task-card-${t.id}">
          <div class="task-top-row">
            <div class="task-title-area">
              <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${isDone ? 'checked' : ''} ${!canEdit ? 'disabled' : ''}>
              <span class="task-title">${t.title}</span>
            </div>
            <span class="task-assignee">👤 ${t.assigneeName}</span>
          </div>

          <div class="task-meta-row">
            <span>年級: <strong>${t.grade}</strong></span>
            <span>科目: <strong>${t.subject}</strong></span>
            <span>類別: <strong>${t.category}</strong></span>
            <span>截止日期: 📅 <strong>${t.dueDate || '未定'}</strong></span>
            <span>進度: <strong>${t.progress}%</strong></span>
          </div>

          ${t.note ? `<div class="task-note-box">📝 <strong>工作備註：</strong>${t.note}</div>` : ''}

          ${canEdit ? `
            <div class="task-actions">
              <button class="btn-sm btn-edit-sm" data-action="edit" data-id="${t.id}">✏️ 編輯進度與備註</button>
              ${isAdmin ? `<button class="btn-sm btn-delete-sm" data-action="delete" data-id="${t.id}">🗑️ 刪除</button>` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    elements.tasksList.querySelectorAll('.task-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const tid = e.target.getAttribute('data-id');
        const task = state.tasks.find(t => t.id === tid);
        if (task) {
          task.status = e.target.checked ? 'completed' : 'in_progress';
          task.progress = e.target.checked ? 100 : 50;
          saveStorage('115_english_tasks', state.tasks);
          renderTasks();
          showToast(`已更新「${task.title}」完成狀態！`);
        }
      });
    });

    elements.tasksList.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const tid = btn.getAttribute('data-id');

        if (action === 'delete') {
          if (confirm('確定要刪除此工作事項嗎？')) {
            state.tasks = state.tasks.filter(t => t.id !== tid);
            saveStorage('115_english_tasks', state.tasks);
            renderTasks();
            updateUserProfileUI();
            showToast('已刪除工作事項');
          }
        } else if (action === 'edit') {
          openTaskModal(tid);
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 11. Admin Panel Renderer
  // --------------------------------------------------------------------------
  function renderAdmin() {
    elements.adminTeacherAccountList.innerHTML = state.teachers.map(t => `
      <div class="subject-row">
        <div>
          <strong>${t.avatar} ${t.name}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">帳號: <code>${t.username}</code> | 密碼: <code>${t.password}</code></div>
        </div>
        <span class="user-role-tag">${t.role === 'admin' ? '科負責人' : '科務教師'}</span>
      </div>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // Modal Handlers
  // --------------------------------------------------------------------------
  function openSetterModal(id) {
    const row = state.examSetters.find(s => s.id === id);
    if (!row) return;

    elements.setterFormId.value = row.id;
    elements.setterFormGradeSubject.value = `${row.grade} - ${row.subject}`;
    elements.setterFormExam1Teacher.value = row.exam1 || '';
    elements.setterFormScope1.value = row.scope1 || '';
    elements.setterFormExam2Teacher.value = row.exam2 || '';
    elements.setterFormScope2.value = row.scope2 || '';
    elements.setterFormFinalExamTeacher.value = row.finalExam || '';
    elements.setterFormFinalScope.value = row.finalScope || '';

    elements.editSetterModal.style.display = 'flex';
    elements.editSetterModal.classList.add('active');
  }

  function openTaskModal(taskId = null) {
    elements.taskFormAssignee.innerHTML = state.teachers.map(t => `
      <option value="${t.name}">${t.avatar} ${t.name}</option>
    `).join('');

    if (taskId) {
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        elements.taskModalTitle.textContent = '✏️ 編輯科務工作事項';
        elements.taskFormId.value = task.id;
        elements.taskFormTitle.value = task.title;
        elements.taskFormAssignee.value = task.assigneeName;
        elements.taskFormGrade.value = task.grade;
        elements.taskFormSubject.value = task.subject;
        elements.taskFormDueDate.value = task.dueDate || '';
        elements.taskFormNote.value = task.note || '';
      }
    } else {
      elements.taskModalTitle.textContent = '➕ 新增科務工作事項';
      elements.taskFormId.value = '';
      elements.taskForm.reset();
      if (state.currentUser) {
        elements.taskFormAssignee.value = state.currentUser.name;
      }
    }

    elements.taskModal.style.display = 'flex';
    elements.taskModal.classList.add('active');
  }

  // --------------------------------------------------------------------------
  // Event Listeners Binding (Global Event Delegation)
  // --------------------------------------------------------------------------
  function bindEvents() {
    // Hash change listener for browser navigation
    window.addEventListener('hashchange', () => {
      if (window.location.hash) {
        const hashView = window.location.hash.replace('#', '');
        if (document.getElementById(`sec-${hashView}`)) {
          switchView(hashView);
        }
      }
    });

    // Universal Document-Level Event Delegation for view switching
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-view], [data-nav]');
      if (target) {
        const view = target.getAttribute('data-view') || target.getAttribute('data-nav');
        if (view && document.getElementById(`sec-${view}`)) {
          e.preventDefault();
          switchView(view);
        }
      }
    });

    // Detail modal close handlers
    if (elements.btnCloseDetailModal) {
      elements.btnCloseDetailModal.addEventListener('click', () => elements.detailModal.classList.remove('active'));
    }
    if (elements.btnDetailClose) {
      elements.btnDetailClose.addEventListener('click', () => elements.detailModal.classList.remove('active'));
    }

    // Copy Notion Markdown
    if (elements.btnCopyNotionMarkdown) {
      elements.btnCopyNotionMarkdown.addEventListener('click', () => {
        if (elements.notionMarkdownPreview) {
          navigator.clipboard.writeText(elements.notionMarkdownPreview.textContent).then(() => {
            showToast('已複製 Notion Markdown 文本！可直接貼入 Notion');
          }).catch(err => {
            console.error('Clipboard copy failed:', err);
            showToast('請直接手動選取複製框中文本！');
          });
        }
      });
    }

    // Search and Grade Filters
    elements.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderTimeline();
      renderTasks();
    });

    elements.gradeFilterSelect.addEventListener('change', (e) => {
      state.gradeFilter = e.target.value;
      renderRoster();
    });

    // Auto distribute setters button
    elements.btnAutoDistributeSetters.addEventListener('click', () => {
      if (confirm('確定要依據 115 學年度授課班級平均分配段考與期末考出題人員嗎？')) {
        autoDistributeExamSetters();
      }
    });

    // Login Modal
    elements.btnSwitchUser.addEventListener('click', () => {
      elements.loginModal.style.display = 'flex';
      elements.loginModal.classList.add('active');
    });
    elements.btnCloseLoginModal.addEventListener('click', () => elements.loginModal.classList.remove('active'));

    elements.loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const un = elements.loginUsername.value.trim();
      const pw = elements.loginPassword.value.trim();

      const found = state.teachers.find(t => t.username === un && t.password === pw);
      if (found) {
        state.currentUser = found;
        updateUserProfileUI();
        renderTasks();
        renderAdmin();
        elements.loginModal.classList.remove('active');
        showToast(`歡迎回來，${found.name}！`);
      } else {
        alert('帳號或密碼錯誤（科負責人帳號 ho / 密碼 11502）');
      }
    });

    // Setter Modal Submit
    elements.btnCloseSetterModal.addEventListener('click', () => elements.editSetterModal.classList.remove('active'));
    elements.editSetterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = elements.setterFormId.value;
      const row = state.examSetters.find(s => s.id === id);
      if (row) {
        row.exam1 = elements.setterFormExam1Teacher.value.trim();
        row.scope1 = elements.setterFormScope1.value.trim();
        row.exam2 = elements.setterFormExam2Teacher.value.trim();
        row.scope2 = elements.setterFormScope2.value.trim();
        row.finalExam = elements.setterFormFinalExamTeacher.value.trim();
        row.finalScope = elements.setterFormFinalScope.value.trim();

        saveStorage('115_english_exam_setters', state.examSetters);
        renderSetters();
        elements.editSetterModal.classList.remove('active');
        showToast('已更新出題教師與範圍！');
      }
    });

    // Task Modal Submit
    elements.btnNewTask.addEventListener('click', () => openTaskModal());
    elements.btnCoeditNewTask.addEventListener('click', () => openTaskModal());
    elements.btnCloseTaskModal.addEventListener('click', () => elements.taskModal.classList.remove('active'));

    elements.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = elements.taskFormId.value;
      const title = elements.taskFormTitle.value.trim();
      const assigneeName = elements.taskFormAssignee.value;
      const grade = elements.taskFormGrade.value;
      const subject = elements.taskFormSubject.value.trim() || '英文';
      const dueDate = elements.taskFormDueDate.value;
      const note = elements.taskFormNote.value.trim();

      if (id) {
        const task = state.tasks.find(t => t.id === id);
        if (task) {
          task.title = title;
          task.assigneeName = assigneeName;
          task.grade = grade;
          task.subject = subject;
          task.dueDate = dueDate;
          task.note = note;
        }
      } else {
        const newTask = {
          id: 'task_' + Date.now(),
          title,
          assigneeId: state.currentUser ? state.currentUser.id : 'unknown',
          assigneeName,
          grade,
          subject,
          category: '科務工作',
          dueDate,
          status: 'in_progress',
          progress: 30,
          note
        };
        state.tasks.unshift(newTask);
      }

      saveStorage('115_english_tasks', state.tasks);
      renderTasks();
      updateUserProfileUI();
      elements.taskModal.classList.remove('active');
      showToast('工作事項已儲存！');
    });

    // Task Filter Toggles
    elements.btnFilterMyTasks.addEventListener('click', () => {
      elements.btnFilterMyTasks.classList.add('active');
      elements.btnFilterOnlyMine.classList.remove('active');
      state.onlyMine = false;
      renderTasks();
    });

    elements.btnFilterOnlyMine.addEventListener('click', () => {
      elements.btnFilterOnlyMine.classList.active && elements.btnFilterOnlyMine.classList.add('active');
      elements.btnFilterMyTasks.classList.remove('active');
      state.onlyMine = true;
      renderTasks();
    });

    // Admin Update Teacher Assignment
    elements.btnAdminUpdateTeacher.addEventListener('click', () => {
      if (!state.currentUser || state.currentUser.role !== 'admin') {
        alert('只有英文科負責人 (何妃卿 老師) 可以進行全校任課更換操作！');
        return;
      }
      const course = elements.adminSelectCourse.value;
      const newTeacher = elements.adminSelectTeacher.value;

      state.roster.grades.forEach(g => {
        g.sections.forEach(sec => {
          sec.items.forEach(item => {
            if (item.name.includes(course)) {
              item.teacher = newTeacher;
            }
          });
        });
      });

      saveStorage('115_english_roster', state.roster);
      renderRoster();
      showToast(`已成功將「${course}」更換為 ${newTeacher}！`);
    });

    // Reset Data Trigger
    elements.btnResetData.addEventListener('click', () => {
      if (confirm('確定要將所有數據重置為 115 學年度上傳最新預設資料嗎？')) {
        localStorage.removeItem('115_english_teachers');
        localStorage.removeItem('115_english_tasks');
        localStorage.removeItem('115_english_roster');
        localStorage.removeItem('115_english_exam_setters');
        localStorage.removeItem('115_english_exam_specs');

        state.teachers = INITIAL_TEACHERS;
        state.tasks = INITIAL_TASKS;
        state.roster = COURSE_ASSIGNMENTS;
        state.examSetters = INITIAL_EXAM_SETTERS;
        state.examSpecs = INITIAL_EXAM_SPECS;
        state.currentUser = INITIAL_TEACHERS.find(t => t.id === 'ho_fei_ching') || INITIAL_TEACHERS[0];

        updateUserProfileUI();
        renderAllViews();
        showToast('已恢復 115 最新數據！');
      }
    });

    // Export JSON Data
    elements.btnExportData.addEventListener('click', () => {
      const exportObject = {
        academicYear: '115學年度',
        exportDate: new Date().toISOString(),
        inCharge: '何妃卿 老師',
        deputy: '陳文宗 老師',
        teachers: state.teachers,
        tasks: state.tasks,
        roster: state.roster,
        examSetters: state.examSetters,
        examSpecs: state.examSpecs
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `115學年度高中英文課務備份_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('已成功匯出 JSON 備份檔案！');
    });
  }

  // Run initialization
  init();
});
