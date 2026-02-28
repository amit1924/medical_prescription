// (function () {
//   // ------ config ------
//   const API_BASE =
//     window.location.hostname === 'localhost'
//       ? 'http://localhost:3000'
//       : 'https://medical-prescription-backend.vercel.app';
//   const STORAGE_KEY = 'medPrescUser';

//   // state
//   let currentUser = null; // { id, email }
//   let allFiles = []; // store files for stats
//   let filteredFiles = []; // filtered and sorted files for display

//   // DOM elements
//   const authCard = document.getElementById('authCard');
//   const mainApp = document.getElementById('mainApp');
//   const tabLogin = document.getElementById('tabLogin');
//   const tabSignup = document.getElementById('tabSignup');
//   const loginForm = document.getElementById('loginForm');
//   const signupForm = document.getElementById('signupForm');
//   const forgotContainer = document.getElementById('forgotContainer');
//   const stepEmailDiv = document.getElementById('stepEmail');
//   const stepTokenDiv = document.getElementById('stepToken');
//   const authMessage = document.getElementById('authMessage');
//   const authSuccess = document.getElementById('authSuccess');

//   // inputs
//   const loginEmail = document.getElementById('loginEmail');
//   const loginPassword = document.getElementById('loginPassword');
//   const signupEmail = document.getElementById('signupEmail');
//   const signupPassword = document.getElementById('signupPassword');
//   const resetEmail = document.getElementById('resetEmail');
//   const tokenInput = document.getElementById('tokenInput');
//   const newPass = document.getElementById('newPass');
//   const confirmPass = document.getElementById('confirmPass');
//   const fileInput = document.getElementById('fileInput');
//   const selectedFileName = document.getElementById('selectedFileName');
//   const doctorName = document.getElementById('doctorName');
//   const prescDate = document.getElementById('prescDate');
//   const prescriptionsDiv = document.getElementById('prescriptionsList');
//   const emptyMsg = document.getElementById('emptyMessage');
//   const refreshBtn = document.getElementById('refreshList');
//   const uploadBtn = document.getElementById('uploadBtn');

//   // Search and filter elements
//   const searchInput = document.getElementById('searchInput');
//   const yearFilter = document.getElementById('yearFilter');
//   const sortSelect = document.getElementById('sortSelect');
//   const clearFiltersBtn = document.getElementById('clearFiltersBtn');

//   // Sidebar elements
//   const sidebar = document.getElementById('sidebar');
//   const hamburgerBtn = document.getElementById('hamburgerBtn');
//   const sidebarUserProfile = document.getElementById('sidebarUserProfile');
//   const sidebarUserName = document.getElementById('sidebarUserName');
//   const sidebarUserEmail = document.getElementById('sidebarUserEmail');
//   const sidebarStats = document.getElementById('sidebarStats');
//   const sidebarFooter = document.getElementById('sidebarFooter');
//   const sidebarGuest = document.getElementById('sidebarGuest');
//   const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
//   const totalFilesStat = document.getElementById('totalFilesStat');
//   const uniqueDoctorsStat = document.getElementById('uniqueDoctorsStat');
//   const doctorListContainer = document.getElementById('doctorListContainer');

//   // Toast and Loading elements
//   const toastContainer = document.getElementById('toastContainer');
//   const loadingOverlay = document.getElementById('loadingOverlay');
//   const loadingText = document.getElementById('loadingText');

//   // ===== TOAST SYSTEM =====
//   class ToastManager {
//     constructor(container) {
//       this.container = container;
//       this.toasts = new Map();
//       this.counter = 0;
//     }

//     show(options) {
//       const id = this.counter++;
//       const {
//         title = 'Notification',
//         message = '',
//         type = 'info',
//         duration = 4000,
//         action = null,
//       } = options;

//       // Create toast element
//       const toast = document.createElement('div');
//       toast.className = `toast ${type}`;
//       toast.dataset.id = id;

//       // Icons for different types
//       const icons = {
//         success: '✓',
//         error: '✕',
//         warning: '⚠',
//         info: 'ℹ',
//       };

//       toast.innerHTML = `
//         <div class="toast-icon">${icons[type] || 'ℹ'}</div>
//         <div class="toast-content">
//           <div class="toast-title">${title}</div>
//           <div class="toast-message">${message}</div>
//         </div>
//         <button class="toast-close" aria-label="Close">✕</button>
//       `;

//       // Add to container
//       this.container.appendChild(toast);

//       // Trigger reflow for animation
//       toast.offsetHeight;
//       toast.classList.add('show');

//       // Setup close button with touch-friendly event
//       const closeBtn = toast.querySelector('.toast-close');

//       // Use both click and touchend for reliable mobile interaction
//       const closeHandler = (e) => {
//         e.preventDefault();
//         e.stopPropagation();
//         this.dismiss(id);
//       };

//       closeBtn.addEventListener('click', closeHandler);
//       closeBtn.addEventListener('touchend', closeHandler, { passive: false });

//       // Also dismiss on toast tap (optional)
//       toast.addEventListener('click', (e) => {
//         if (
//           e.target === toast ||
//           e.target.classList.contains('toast-content') ||
//           e.target.classList.contains('toast-message') ||
//           e.target.classList.contains('toast-title')
//         ) {
//           if (action) {
//             action();
//           }
//           this.dismiss(id);
//         }
//       });

//       // Auto dismiss after duration
//       if (duration > 0) {
//         const timeout = setTimeout(() => this.dismiss(id), duration);
//         this.toasts.set(id, { element: toast, timeout });
//       } else {
//         this.toasts.set(id, { element: toast });
//       }

//       return id;
//     }

//     dismiss(id) {
//       const toastData = this.toasts.get(id);
//       if (!toastData) return;

//       const { element, timeout } = toastData;

//       // Clear auto-dismiss timeout
//       if (timeout) clearTimeout(timeout);

//       // Add removing class for exit animation
//       element.classList.add('toast-removing');
//       element.classList.remove('show');

//       // Remove from DOM after animation
//       setTimeout(() => {
//         if (element.parentNode) {
//           element.parentNode.removeChild(element);
//         }
//         this.toasts.delete(id);
//       }, 300);
//     }

//     success(message, title = 'Success', duration = 4000, action = null) {
//       return this.show({ title, message, type: 'success', duration, action });
//     }

//     error(message, title = 'Error', duration = 5000, action = null) {
//       return this.show({ title, message, type: 'error', duration, action });
//     }

//     warning(message, title = 'Warning', duration = 4000, action = null) {
//       return this.show({ title, message, type: 'warning', duration, action });
//     }

//     info(message, title = 'Info', duration = 4000, action = null) {
//       return this.show({ title, message, type: 'info', duration, action });
//     }
//   }

//   // ===== LOADING MANAGER =====
//   class LoadingManager {
//     constructor(overlay, textElement) {
//       this.overlay = overlay;
//       this.textElement = textElement;
//       this.activeLoaders = new Set();
//       this.timeout = null;
//     }

//     show(message = 'Processing...') {
//       this.textElement.textContent = message;
//       this.overlay.classList.add('active');

//       // Auto-hide after 30 seconds (safety)
//       if (this.timeout) clearTimeout(this.timeout);
//       this.timeout = setTimeout(() => {
//         if (this.activeLoaders.size > 0) {
//           console.warn('Loader auto-hidden after timeout');
//           this.hide();
//         }
//       }, 30000);
//     }

//     hide() {
//       if (this.timeout) {
//         clearTimeout(this.timeout);
//         this.timeout = null;
//       }
//       this.overlay.classList.remove('active');
//     }

//     async withLoader(fn, message = 'Processing...') {
//       const loaderId = Symbol();
//       this.activeLoaders.add(loaderId);

//       if (this.activeLoaders.size === 1) {
//         this.show(message);
//       }

//       try {
//         return await fn();
//       } finally {
//         this.activeLoaders.delete(loaderId);
//         if (this.activeLoaders.size === 0) {
//           this.hide();
//         }
//       }
//     }

//     // For button loading states
//     setButtonLoading(button, isLoading, text = null) {
//       if (isLoading) {
//         button.classList.add('btn-loading');
//         button.disabled = true;
//         if (text) button.dataset.originalText = button.textContent;
//       } else {
//         button.classList.remove('btn-loading');
//         button.disabled = false;
//         if (text && button.dataset.originalText) {
//           button.textContent = button.dataset.originalText;
//         }
//       }
//     }

//     // Show success animation and auto-hide
//     showSuccess(message = 'Success!', duration = 1500) {
//       const originalContent = this.overlay.innerHTML;

//       this.overlay.innerHTML = `
//         <div class="checkmark-success">
//           <svg viewBox="0 0 52 52">
//             <path d="M14 27 L22 35 L38 17" />
//           </svg>
//         </div>
//         <div class="loading-text" style="animation: none;">${message}</div>
//       `;

//       this.overlay.classList.add('active');

//       setTimeout(() => {
//         this.overlay.innerHTML = originalContent;
//         this.textElement = document.getElementById('loadingText');
//         this.overlay.classList.remove('active');
//       }, duration);
//     }
//   }

//   // Initialize toast and loading managers
//   const toast = new ToastManager(toastContainer);
//   const loader = new LoadingManager(loadingOverlay, loadingText);

//   // Add loading state to cards
//   function setCardLoading(cardId, isLoading) {
//     const card = document.querySelector(`.pres-card[data-id="${cardId}"]`);
//     if (card) {
//       if (isLoading) {
//         card.classList.add('loading');
//       } else {
//         card.classList.remove('loading');
//       }
//     }
//   }

//   // Load user from localStorage on page load
//   function loadUserFromStorage() {
//     const stored = localStorage.getItem(STORAGE_KEY);
//     if (stored) {
//       try {
//         currentUser = JSON.parse(stored);
//       } catch (e) {
//         console.error('Failed to parse stored user', e);
//         localStorage.removeItem(STORAGE_KEY);
//       }
//     }
//   }

//   // Save user to localStorage
//   function saveUserToStorage(user) {
//     if (user) {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
//     } else {
//       localStorage.removeItem(STORAGE_KEY);
//     }
//   }

//   // Hamburger toggle with touch optimization
//   hamburgerBtn.addEventListener('click', (e) => {
//     e.preventDefault();
//     sidebar.classList.toggle('collapsed');
//   });

//   hamburgerBtn.addEventListener('touchend', (e) => {
//     e.preventDefault();
//     sidebar.classList.toggle('collapsed');
//   });

//   // Close sidebar on mobile when clicking outside (optional)
//   document.addEventListener('click', (e) => {
//     if (window.innerWidth <= 768) {
//       if (!sidebar.contains(e.target) && !hamburgerBtn.contains(e.target)) {
//         sidebar.classList.add('collapsed');
//       }
//     }
//   });

//   // Helper: show/hide messages
//   function setAuthError(msg) {
//     if (msg) {
//       authMessage.innerText = msg;
//       authMessage.classList.remove('hidden');
//       authSuccess.classList.add('hidden');
//       toast.error(msg, 'Authentication Error');
//     } else {
//       authMessage.classList.add('hidden');
//     }
//   }

//   function setAuthSuccess(msg) {
//     if (msg) {
//       authSuccess.innerText = msg;
//       authSuccess.classList.remove('hidden');
//       authMessage.classList.add('hidden');
//       toast.success(msg, 'Success');
//     } else {
//       authSuccess.classList.add('hidden');
//     }
//   }

//   // Update sidebar stats
//   function updateSidebarStats() {
//     if (!currentUser || allFiles.length === 0) {
//       totalFilesStat.innerText = allFiles.length;
//       uniqueDoctorsStat.innerText = '0';
//       doctorListContainer.innerHTML =
//         '<div class="doctor-item"><span class="doctor-name">No data</span><span class="doctor-count">-</span></div>';
//       return;
//     }

//     // Total files
//     totalFilesStat.innerText = allFiles.length;

//     // Count by doctor
//     const doctorCounts = {};
//     allFiles.forEach((f) => {
//       const doc = f.doctor || 'Unknown';
//       doctorCounts[doc] = (doctorCounts[doc] || 0) + 1;
//     });

//     uniqueDoctorsStat.innerText = Object.keys(doctorCounts).length;

//     // Build doctor list
//     const sortedDocs = Object.entries(doctorCounts).sort((a, b) => b[1] - a[1]);
//     doctorListContainer.innerHTML = sortedDocs
//       .map(
//         ([doc, count]) => `
//               <div class="doctor-item">
//                 <span class="doctor-name">${doc}</span>
//                 <span class="doctor-count">${count}</span>
//               </div>
//             `,
//       )
//       .join('');

//     if (sortedDocs.length === 0) {
//       doctorListContainer.innerHTML =
//         '<div class="doctor-item"><span class="doctor-name">No doctors</span><span class="doctor-count">-</span></div>';
//     }
//   }

//   // Filter and sort functions
//   function updateYearFilterOptions() {
//     const years = new Set();
//     allFiles.forEach((file) => {
//       if (file.date) {
//         const year = file.date.split('-')[0];
//         years.add(year);
//       }
//     });

//     const sortedYears = Array.from(years).sort((a, b) => b - a);
//     yearFilter.innerHTML =
//       '<option value="all">All Years</option>' +
//       sortedYears
//         .map((year) => `<option value="${year}">${year}</option>`)
//         .join('');
//   }

//   function filterAndSortFiles() {
//     if (!allFiles.length) {
//       filteredFiles = [];
//       return;
//     }

//     // Apply search filter
//     const searchTerm = searchInput.value.toLowerCase();
//     let filtered = allFiles.filter((file) => {
//       const matchesSearch =
//         (file.doctor && file.doctor.toLowerCase().includes(searchTerm)) ||
//         (file.filename && file.filename.toLowerCase().includes(searchTerm));
//       return matchesSearch;
//     });

//     // Apply year filter
//     const selectedYear = yearFilter.value;
//     if (selectedYear !== 'all') {
//       filtered = filtered.filter(
//         (file) => file.date && file.date.startsWith(selectedYear),
//       );
//     }

//     // Apply sorting
//     const sortOption = sortSelect.value;
//     filtered.sort((a, b) => {
//       switch (sortOption) {
//         case 'newest':
//           return (b.date || '').localeCompare(a.date || '');
//         case 'oldest':
//           return (a.date || '').localeCompare(b.date || '');
//         case 'doctor-asc':
//           return (a.doctor || '').localeCompare(b.doctor || '');
//         case 'doctor-desc':
//           return (b.doctor || '').localeCompare(a.doctor || '');
//         case 'filename-asc':
//           return (a.filename || '').localeCompare(b.filename || '');
//         case 'filename-desc':
//           return (b.filename || '').localeCompare(a.filename || '');
//         default:
//           return 0;
//       }
//     });

//     filteredFiles = filtered;
//   }

//   function renderPrescriptions() {
//     filterAndSortFiles();

//     if (filteredFiles.length === 0) {
//       prescriptionsDiv.innerHTML = '';
//       emptyMsg.style.display = 'block';
//       return;
//     }

//     emptyMsg.style.display = 'none';
//     prescriptionsDiv.innerHTML = filteredFiles
//       .map(
//         (f) => `
//               <div class="pres-card" data-id="${f.id}">
//                 <div class="filename">📄 ${f.filename}</div>
//                 <div class="pres-meta">
//                   <span><strong>👨‍⚕️</strong> ${f.doctor || '—'}</span>
//                   <span><strong>📅</strong> ${f.date || '—'}</span>
//                 </div>
//                 <div class="card-actions">
//                   <button class="btn-icon view-btn" data-metaid="${f.id}">👁 view</button>
//                   <button class="btn-icon edit" data-metaid="${f.id}">✎ edit</button>
//                   <button class="btn-icon delete" data-metaid="${f.id}">✕ delete</button>
//                 </div>
//                 <div class="edit-row hidden" id="edit-${f.id}">
//                   <input type="text" id="edit-doctor-${f.id}" placeholder="doctor" value="${f.doctor || ''}">
//                   <input type="date" id="edit-date-${f.id}" value="${f.date || ''}">
//                   <div class="flex">
//                     <button class="btn-icon save-edit" data-id="${f.id}">save</button>
//                     <button class="btn-icon cancel-edit" data-id="${f.id}">cancel</button>
//                   </div>
//                 </div>
//               </div>
//             `,
//       )
//       .join('');
//   }

//   // render UI based on currentUser
//   function refreshUI() {
//     const loggedIn = !!currentUser;
//     if (loggedIn) {
//       authCard.classList.add('hidden');
//       mainApp.classList.remove('hidden');
//       // sidebar
//       sidebarUserProfile.style.display = 'block';
//       sidebarStats.style.display = 'block';
//       sidebarFooter.style.display = 'block';
//       sidebarGuest.style.display = 'none';
//       sidebarUserName.innerText = currentUser.email.split('@')[0];
//       sidebarUserEmail.innerText = currentUser.email;
//       loadPrescriptions();
//     } else {
//       authCard.classList.remove('hidden');
//       mainApp.classList.add('hidden');
//       sidebarUserProfile.style.display = 'none';
//       sidebarStats.style.display = 'none';
//       sidebarFooter.style.display = 'none';
//       sidebarGuest.style.display = 'block';
//       // default to login tab
//       showLoginTab();
//       setAuthError(null);
//       setAuthSuccess(null);
//       allFiles = [];
//       filteredFiles = [];
//       updateSidebarStats();
//     }
//   }

//   // tab switching
//   function showLoginTab() {
//     tabLogin.classList.add('active');
//     tabSignup.classList.remove('active');
//     loginForm.style.display = 'block';
//     signupForm.style.display = 'none';
//     forgotContainer.style.display = 'none';
//     setAuthError(null);
//   }

//   function showSignupTab() {
//     tabSignup.classList.add('active');
//     tabLogin.classList.remove('active');
//     loginForm.style.display = 'none';
//     signupForm.style.display = 'block';
//     forgotContainer.style.display = 'none';
//     setAuthError(null);
//   }

//   tabLogin.addEventListener('click', showLoginTab);
//   tabLogin.addEventListener('touchend', (e) => {
//     e.preventDefault();
//     showLoginTab();
//   });

//   tabSignup.addEventListener('click', showSignupTab);
//   tabSignup.addEventListener('touchend', (e) => {
//     e.preventDefault();
//     showSignupTab();
//   });

//   // Forgot flow
//   document
//     .getElementById('forgotPasswordBtn')
//     .addEventListener('click', (e) => {
//       e.preventDefault();
//       loginForm.style.display = 'none';
//       signupForm.style.display = 'none';
//       forgotContainer.style.display = 'block';
//       stepEmailDiv.style.display = 'block';
//       stepTokenDiv.style.display = 'none';
//       setAuthError(null);
//     });

//   document
//     .getElementById('forgotPasswordBtn')
//     .addEventListener('touchend', (e) => {
//       e.preventDefault();
//       loginForm.style.display = 'none';
//       signupForm.style.display = 'none';
//       forgotContainer.style.display = 'block';
//       stepEmailDiv.style.display = 'block';
//       stepTokenDiv.style.display = 'none';
//       setAuthError(null);
//     });

//   document
//     .getElementById('backToLoginFromReset')
//     .addEventListener('click', (e) => {
//       e.preventDefault();
//       forgotContainer.style.display = 'none';
//       loginForm.style.display = 'block';
//     });

//   document.getElementById('backToEmail').addEventListener('click', (e) => {
//     e.preventDefault();
//     stepTokenDiv.style.display = 'none';
//     stepEmailDiv.style.display = 'block';
//   });

//   document
//     .getElementById('sendResetLink')
//     .addEventListener('click', async (e) => {
//       e.preventDefault();
//       const btn = e.currentTarget;

//       const email = resetEmail.value.trim();
//       if (!email) return setAuthError('enter email');

//       setAuthError(null);
//       loader.setButtonLoading(btn, true);

//       try {
//         await loader.withLoader(async () => {
//           const res = await fetch(`${API_BASE}/auth/forgot-password`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email }),
//           });
//           const data = await res.json();
//           if (!res.ok) throw new Error(data.error || 'request failed');

//           loader.showSuccess('Link Generated!', 1200);
//           setAuthSuccess('reset link generated (check console / demo token)');

//           if (data.resetLink) {
//             const urlParams = new URLSearchParams(data.resetLink.split('?')[1]);
//             const token = urlParams.get('token');
//             if (token) {
//               stepEmailDiv.style.display = 'none';
//               stepTokenDiv.style.display = 'block';
//               tokenInput.value = token;
//             }
//           }
//         }, 'Sending reset link...');
//       } catch (e) {
//         setAuthError(e.message);
//       } finally {
//         loader.setButtonLoading(btn, false);
//       }
//     });

//   document
//     .getElementById('resetPassBtn')
//     .addEventListener('click', async (e) => {
//       e.preventDefault();
//       const btn = e.currentTarget;

//       const token = tokenInput.value.trim();
//       const pwd = newPass.value;
//       const conf = confirmPass.value;

//       if (!token || !pwd || !conf) return setAuthError('fill all fields');
//       if (pwd !== conf) return setAuthError('passwords mismatch');

//       loader.setButtonLoading(btn, true);

//       try {
//         await loader.withLoader(async () => {
//           const res = await fetch(`${API_BASE}/auth/reset-password`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               token,
//               password: pwd,
//               confirmPassword: conf,
//             }),
//           });
//           const data = await res.json();
//           if (!res.ok) throw new Error(data.error || 'reset failed');

//           loader.showSuccess('Password Updated!', 1500);
//           setAuthSuccess('password updated! please login');

//           setTimeout(() => {
//             forgotContainer.style.display = 'none';
//             loginForm.style.display = 'block';
//             stepEmailDiv.style.display = 'block';
//             stepTokenDiv.style.display = 'none';
//           }, 1500);
//         }, 'Resetting password...');
//       } catch (e) {
//         setAuthError(e.message);
//       } finally {
//         loader.setButtonLoading(btn, false);
//       }
//     });

//   // login
//   document.getElementById('loginBtn').addEventListener('click', async (e) => {
//     e.preventDefault();
//     const btn = e.currentTarget;

//     const email = loginEmail.value.trim();
//     const pass = loginPassword.value;

//     if (!email || !pass) {
//       setAuthError('enter credentials');
//       return;
//     }

//     loader.setButtonLoading(btn, true);

//     try {
//       await loader.withLoader(async () => {
//         const res = await fetch(`${API_BASE}/auth/login`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email, password: pass }),
//         });
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || 'login failed');

//         currentUser = { id: data.id, email: data.email };
//         saveUserToStorage(currentUser);

//         loader.showSuccess('Welcome!', 1000);

//         setTimeout(() => {
//           refreshUI();
//           toast.success(
//             `Welcome back, ${email.split('@')[0]}!`,
//             'Login Successful',
//           );
//         }, 1000);
//       }, 'Logging in...');
//     } catch (e) {
//       setAuthError(e.message);
//     } finally {
//       loader.setButtonLoading(btn, false);
//     }
//   });

//   // login with touch
//   document
//     .getElementById('loginBtn')
//     .addEventListener('touchend', async (e) => {
//       e.preventDefault();
//       const btn = e.currentTarget;

//       const email = loginEmail.value.trim();
//       const pass = loginPassword.value;

//       if (!email || !pass) {
//         setAuthError('enter credentials');
//         return;
//       }

//       loader.setButtonLoading(btn, true);

//       try {
//         await loader.withLoader(async () => {
//           const res = await fetch(`${API_BASE}/auth/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ email, password: pass }),
//           });
//           const data = await res.json();
//           if (!res.ok) throw new Error(data.error || 'login failed');

//           currentUser = { id: data.id, email: data.email };
//           saveUserToStorage(currentUser);

//           loader.showSuccess('Welcome!', 1000);

//           setTimeout(() => {
//             refreshUI();
//             toast.success(
//               `Welcome back, ${email.split('@')[0]}!`,
//               'Login Successful',
//             );
//           }, 1000);
//         }, 'Logging in...');
//       } catch (e) {
//         setAuthError(e.message);
//       } finally {
//         loader.setButtonLoading(btn, false);
//       }
//     });

//   // signup
//   document.getElementById('signupBtn').addEventListener('click', async (e) => {
//     e.preventDefault();
//     const btn = e.currentTarget;

//     const email = signupEmail.value.trim();
//     const pass = signupPassword.value;

//     if (!email || !pass) {
//       setAuthError('email & password');
//       return;
//     }

//     loader.setButtonLoading(btn, true);

//     try {
//       await loader.withLoader(async () => {
//         const res = await fetch(`${API_BASE}/auth/signup`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email, password: pass }),
//         });
//         const data = await res.json();
//         if (!res.ok) throw new Error(data.error || 'signup failed');

//         loader.showSuccess('Account Created!', 1200);
//         setAuthSuccess('account created! please login.');

//         setTimeout(() => {
//           showLoginTab();
//           loginEmail.value = email;
//         }, 1200);
//       }, 'Creating account...');
//     } catch (e) {
//       setAuthError(e.message);
//     } finally {
//       loader.setButtonLoading(btn, false);
//     }
//   });

//   // logout (both buttons)
//   function logout() {
//     currentUser = null;
//     saveUserToStorage(null);
//     refreshUI();
//     toast.info('You have been logged out', 'Goodbye');
//   }

//   sidebarLogoutBtn.addEventListener('click', (e) => {
//     e.preventDefault();
//     logout();
//   });

//   sidebarLogoutBtn.addEventListener('touchend', (e) => {
//     e.preventDefault();
//     logout();
//   });

//   // file upload
//   fileInput.addEventListener('change', () => {
//     selectedFileName.innerText = fileInput.files[0]?.name || '';
//   });

//   document
//     .getElementById('fileDropZone')
//     .addEventListener('click', () => fileInput.click());
//   document.getElementById('fileDropZone').addEventListener('touchend', (e) => {
//     e.preventDefault();
//     fileInput.click();
//   });

//   uploadBtn.addEventListener('click', async (e) => {
//     e.preventDefault();
//     const btn = e.currentTarget;

//     if (!currentUser) return;

//     const file = fileInput.files[0];
//     if (!file) {
//       toast.warning('Please select a file to upload', 'No File Selected');
//       return;
//     }

//     const doctor = doctorName.value.trim() || 'Unknown';
//     const date = prescDate.value || new Date().toISOString().split('T')[0];

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('userId', currentUser.id);
//     formData.append('doctor', doctor);
//     formData.append('date', date);

//     loader.setButtonLoading(btn, true);
//     const uploadingToast = toast.info(
//       'Uploading your prescription...',
//       'Uploading',
//       0,
//     );

//     try {
//       await loader.withLoader(async () => {
//         const res = await fetch(`${API_BASE}/upload`, {
//           method: 'POST',
//           body: formData,
//         });
//         const data = await res.json();

//         if (!res.ok) throw new Error(data.error || 'upload error');

//         toast.dismiss(uploadingToast);
//         loader.showSuccess('Upload Complete!', 1200);

//         setTimeout(() => {
//           fileInput.value = '';
//           selectedFileName.innerText = '';
//           doctorName.value = '';
//           prescDate.value = date;
//           loadPrescriptions();
//           toast.success(
//             'Your prescription has been uploaded successfully',
//             'Upload Complete',
//           );
//         }, 1200);
//       }, 'Uploading prescription...');
//     } catch (e) {
//       toast.dismiss(uploadingToast);
//       toast.error('Upload failed: ' + e.message, 'Upload Failed');
//     } finally {
//       loader.setButtonLoading(btn, false);
//     }
//   });

//   uploadBtn.addEventListener('touchend', async (e) => {
//     e.preventDefault();
//     const btn = e.currentTarget;

//     if (!currentUser) return;

//     const file = fileInput.files[0];
//     if (!file) {
//       toast.warning('Please select a file to upload', 'No File Selected');
//       return;
//     }

//     const doctor = doctorName.value.trim() || 'Unknown';
//     const date = prescDate.value || new Date().toISOString().split('T')[0];

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('userId', currentUser.id);
//     formData.append('doctor', doctor);
//     formData.append('date', date);

//     loader.setButtonLoading(btn, true);
//     const uploadingToast = toast.info(
//       'Uploading your prescription...',
//       'Uploading',
//       0,
//     );

//     try {
//       await loader.withLoader(async () => {
//         const res = await fetch(`${API_BASE}/upload`, {
//           method: 'POST',
//           body: formData,
//         });
//         const data = await res.json();

//         if (!res.ok) throw new Error(data.error || 'upload error');

//         toast.dismiss(uploadingToast);
//         loader.showSuccess('Upload Complete!', 1200);

//         setTimeout(() => {
//           fileInput.value = '';
//           selectedFileName.innerText = '';
//           doctorName.value = '';
//           prescDate.value = date;
//           loadPrescriptions();
//           toast.success(
//             'Your prescription has been uploaded successfully',
//             'Upload Complete',
//           );
//         }, 1200);
//       }, 'Uploading prescription...');
//     } catch (e) {
//       toast.dismiss(uploadingToast);
//       toast.error('Upload failed: ' + e.message, 'Upload Failed');
//     } finally {
//       loader.setButtonLoading(btn, false);
//     }
//   });

//   // load prescriptions
//   async function loadPrescriptions() {
//     if (!currentUser) return;

//     try {
//       await loader.withLoader(async () => {
//         const res = await fetch(`${API_BASE}/files?userId=${currentUser.id}`);
//         if (!res.ok) throw new Error('failed to fetch');
//         const files = await res.json();
//         allFiles = files;
//         updateYearFilterOptions();
//         updateSidebarStats();
//         renderPrescriptions();
//       }, 'Loading prescriptions...');
//     } catch (e) {
//       console.error(e);
//       toast.error('Failed to load prescriptions', 'Error');
//     }
//   }

//   // Event listeners for search and filter
//   searchInput.addEventListener('input', renderPrescriptions);
//   yearFilter.addEventListener('change', renderPrescriptions);
//   sortSelect.addEventListener('change', renderPrescriptions);

//   clearFiltersBtn.addEventListener('click', (e) => {
//     e.preventDefault();
//     searchInput.value = '';
//     yearFilter.value = 'all';
//     sortSelect.value = 'newest';
//     renderPrescriptions();
//     toast.info('All filters have been cleared', 'Filters Cleared');
//   });

//   clearFiltersBtn.addEventListener('touchend', (e) => {
//     e.preventDefault();
//     searchInput.value = '';
//     yearFilter.value = 'all';
//     sortSelect.value = 'newest';
//     renderPrescriptions();
//     toast.info('All filters have been cleared', 'Filters Cleared');
//   });

//   // handle view, edit, delete (delegation) with touch support
//   prescriptionsDiv.addEventListener('click', async (e) => {
//     await handlePrescriptionAction(e);
//   });

//   prescriptionsDiv.addEventListener('touchend', async (e) => {
//     e.preventDefault();
//     await handlePrescriptionAction(e);
//   });

//   async function handlePrescriptionAction(e) {
//     const target = e.target;
//     if (!currentUser) return;

//     const metaId = target.dataset.metaid;

//     if (target.classList.contains('delete') && metaId) {
//       e.preventDefault();

//       loader.setButtonLoading(target, true);

//       try {
//         await loader.withLoader(async () => {
//           const res = await fetch(`${API_BASE}/file/${metaId}`, {
//             method: 'DELETE',
//           });
//           if (!res.ok) throw new Error();

//           loader.showSuccess('Deleted!', 800);

//           setTimeout(() => {
//             loadPrescriptions();
//             toast.success('Prescription has been deleted', 'Delete Complete');
//           }, 800);
//         }, 'Deleting prescription...');
//       } catch {
//         toast.error('Failed to delete prescription', 'Delete Failed');
//       } finally {
//         loader.setButtonLoading(target, false);
//       }
//     }

//     if (target.classList.contains('save-edit')) {
//       const id = target.dataset.id;
//       loader.setButtonLoading(target, true);

//       const doctor = document.getElementById(`edit-doctor-${id}`).value;
//       const date = document.getElementById(`edit-date-${id}`).value;

//       try {
//         await loader.withLoader(async () => {
//           const res = await fetch(`${API_BASE}/file/${id}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ doctor, date }),
//           });
//           if (!res.ok) throw new Error();

//           document.getElementById(`edit-${id}`).classList.add('hidden');
//           loader.showSuccess('Updated!', 800);

//           setTimeout(() => {
//             loadPrescriptions();
//             toast.success('Prescription updated successfully', 'Edit Complete');
//           }, 800);
//         }, 'Updating...');
//       } catch {
//         toast.error('Failed to update prescription', 'Edit Failed');
//       } finally {
//         loader.setButtonLoading(target, false);
//       }
//       return;
//     }

//     if (!metaId) return;

//     if (target.classList.contains('view-btn')) {
//       window.open(`${API_BASE}/file/${metaId}`, '_blank');
//       toast.info('Opening prescription...', 'View');
//     }

//     if (target.classList.contains('edit')) {
//       document.getElementById(`edit-${metaId}`).classList.toggle('hidden');
//     }

//     if (target.classList.contains('cancel-edit')) {
//       const id = target.dataset.id;
//       document.getElementById(`edit-${id}`).classList.add('hidden');
//     }
//   }

//   refreshBtn.addEventListener('click', async (e) => {
//     e.preventDefault();
//     const btn = e.currentTarget;

//     loader.setButtonLoading(btn, true);
//     await loadPrescriptions();
//     loader.setButtonLoading(btn, false);
//     toast.info('Prescription list refreshed', 'Refresh Complete');
//   });

//   refreshBtn.addEventListener('touchend', async (e) => {
//     e.preventDefault();
//     const btn = e.currentTarget;

//     loader.setButtonLoading(btn, true);
//     await loadPrescriptions();
//     loader.setButtonLoading(btn, false);
//     toast.info('Prescription list refreshed', 'Refresh Complete');
//   });

//   // Initialize: load user from storage first
//   loadUserFromStorage();

//   // initial UI render
//   refreshUI();

//   // set today's date as default for date picker
//   const today = new Date().toISOString().split('T')[0];
//   if (prescDate) prescDate.value = today;

//   // Welcome toast for returning users
//   if (currentUser) {
//     setTimeout(() => {
//       toast.success(
//         `Welcome back, ${currentUser.email.split('@')[0]}!`,
//         'Hello',
//       );
//     }, 500);
//   }
// })();

(function () {
  // ------ config ------
  const API_BASE =
    window.location.hostname === 'localhost'
      ? 'http://localhost:3000'
      : 'https://medical-prescription-backend.vercel.app';
  const STORAGE_KEY = 'medPrescUser';

  // state
  let currentUser = null; // { id, email }
  let allFiles = []; // store files for stats
  let filteredFiles = []; // filtered and sorted files for display

  // DOM elements
  const authCard = document.getElementById('authCard');
  const mainApp = document.getElementById('mainApp');
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const forgotContainer = document.getElementById('forgotContainer');
  const stepEmailDiv = document.getElementById('stepEmail');
  const stepTokenDiv = document.getElementById('stepToken');
  const authMessage = document.getElementById('authMessage');
  const authSuccess = document.getElementById('authSuccess');

  // inputs
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const signupEmail = document.getElementById('signupEmail');
  const signupPassword = document.getElementById('signupPassword');
  const resetEmail = document.getElementById('resetEmail');
  const tokenInput = document.getElementById('tokenInput');
  const newPass = document.getElementById('newPass');
  const confirmPass = document.getElementById('confirmPass');
  const fileInput = document.getElementById('fileInput');
  const selectedFileName = document.getElementById('selectedFileName');
  const doctorName = document.getElementById('doctorName');
  const prescDate = document.getElementById('prescDate');
  const prescriptionsDiv = document.getElementById('prescriptionsList');
  const emptyMsg = document.getElementById('emptyMessage');
  const refreshBtn = document.getElementById('refreshList');
  const uploadBtn = document.getElementById('uploadBtn');

  // Search and filter elements
  const searchInput = document.getElementById('searchInput');
  const yearFilter = document.getElementById('yearFilter');
  const sortSelect = document.getElementById('sortSelect');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');

  // Sidebar elements
  const sidebar = document.getElementById('sidebar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebarUserProfile = document.getElementById('sidebarUserProfile');
  const sidebarUserName = document.getElementById('sidebarUserName');
  const sidebarUserEmail = document.getElementById('sidebarUserEmail');
  const sidebarStats = document.getElementById('sidebarStats');
  const sidebarFooter = document.getElementById('sidebarFooter');
  const sidebarGuest = document.getElementById('sidebarGuest');
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  const totalFilesStat = document.getElementById('totalFilesStat');
  const uniqueDoctorsStat = document.getElementById('uniqueDoctorsStat');
  const doctorListContainer = document.getElementById('doctorListContainer');

  // Toast and Loading elements
  const toastContainer = document.getElementById('toastContainer');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const loadingText = document.getElementById('loadingText');

  // ===== TOAST SYSTEM =====
  class ToastManager {
    constructor(container) {
      this.container = container;
      this.toasts = new Map();
      this.counter = 0;
    }

    show(options) {
      const id = this.counter++;
      const {
        title = 'Notification',
        message = '',
        type = 'info',
        duration = 4000,
        action = null,
      } = options;

      // Create toast element
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.dataset.id = id;

      // Icons for different types
      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
      };

      toast.innerHTML = `
        <div class="toast-icon">${icons[type] || 'ℹ'}</div>
        <div class="toast-content">
          <div class="toast-title">${title}</div>
          <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Close">✕</button>
      `;

      // Add to container
      this.container.appendChild(toast);

      // Trigger reflow for animation
      toast.offsetHeight;
      toast.classList.add('show');

      // Setup close button with touch-friendly event
      const closeBtn = toast.querySelector('.toast-close');

      // Use both click and touchend for reliable mobile interaction
      const closeHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dismiss(id);
      };

      closeBtn.addEventListener('click', closeHandler);
      closeBtn.addEventListener('touchend', closeHandler, { passive: false });

      // Also dismiss on toast tap (optional)
      toast.addEventListener('click', (e) => {
        if (
          e.target === toast ||
          e.target.classList.contains('toast-content') ||
          e.target.classList.contains('toast-message') ||
          e.target.classList.contains('toast-title')
        ) {
          if (action) {
            action();
          }
          this.dismiss(id);
        }
      });

      // Auto dismiss after duration
      if (duration > 0) {
        const timeout = setTimeout(() => this.dismiss(id), duration);
        this.toasts.set(id, { element: toast, timeout });
      } else {
        this.toasts.set(id, { element: toast });
      }

      return id;
    }

    dismiss(id) {
      const toastData = this.toasts.get(id);
      if (!toastData) return;

      const { element, timeout } = toastData;

      // Clear auto-dismiss timeout
      if (timeout) clearTimeout(timeout);

      // Add removing class for exit animation
      element.classList.add('toast-removing');
      element.classList.remove('show');

      // Remove from DOM after animation
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        this.toasts.delete(id);
      }, 300);
    }

    success(message, title = 'Success', duration = 4000, action = null) {
      return this.show({ title, message, type: 'success', duration, action });
    }

    error(message, title = 'Error', duration = 5000, action = null) {
      return this.show({ title, message, type: 'error', duration, action });
    }

    warning(message, title = 'Warning', duration = 4000, action = null) {
      return this.show({ title, message, type: 'warning', duration, action });
    }

    info(message, title = 'Info', duration = 4000, action = null) {
      return this.show({ title, message, type: 'info', duration, action });
    }
  }

  // ===== LOADING MANAGER =====
  class LoadingManager {
    constructor(overlay, textElement) {
      this.overlay = overlay;
      this.textElement = textElement;
      this.activeLoaders = new Set();
      this.timeout = null;
    }

    show(message = 'Processing...') {
      this.textElement.textContent = message;
      this.overlay.classList.add('active');

      // Auto-hide after 30 seconds (safety)
      if (this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        if (this.activeLoaders.size > 0) {
          console.warn('Loader auto-hidden after timeout');
          this.hide();
        }
      }, 30000);
    }

    hide() {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      this.overlay.classList.remove('active');
    }

    async withLoader(fn, message = 'Processing...') {
      const loaderId = Symbol();
      this.activeLoaders.add(loaderId);

      if (this.activeLoaders.size === 1) {
        this.show(message);
      }

      try {
        return await fn();
      } finally {
        this.activeLoaders.delete(loaderId);
        if (this.activeLoaders.size === 0) {
          this.hide();
        }
      }
    }

    // For button loading states
    setButtonLoading(button, isLoading, text = null) {
      if (isLoading) {
        button.classList.add('btn-loading');
        button.disabled = true;
        if (text) button.dataset.originalText = button.textContent;
      } else {
        button.classList.remove('btn-loading');
        button.disabled = false;
        if (text && button.dataset.originalText) {
          button.textContent = button.dataset.originalText;
        }
      }
    }

    // Show success animation and auto-hide
    showSuccess(message = 'Success!', duration = 1500) {
      const originalContent = this.overlay.innerHTML;

      this.overlay.innerHTML = `
        <div class="checkmark-success">
          <svg viewBox="0 0 52 52">
            <path d="M14 27 L22 35 L38 17" />
          </svg>
        </div>
        <div class="loading-text" style="animation: none;">${message}</div>
      `;

      this.overlay.classList.add('active');

      setTimeout(() => {
        this.overlay.innerHTML = originalContent;
        this.textElement = document.getElementById('loadingText');
        this.overlay.classList.remove('active');
      }, duration);
    }
  }

  // ===== FILENAME FORMATTING FUNCTION =====
  function formatFilename(filename) {
    if (!filename) return 'Unknown Prescription';

    // Remove file extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    // Check if it's an IMG_ pattern (like IMG_20251204_205741.jpg)
    const imgPattern = /^IMG_(\d{4})(\d{2})(\d{2})_(\d{6})/i;
    const match = nameWithoutExt.match(imgPattern);

    if (match) {
      const [_, year, month, day, time] = match;
      // Format time as HH:MM
      const formattedTime = `${time.substring(0, 2)}:${time.substring(2, 4)}`;
      const date = new Date(year, month - 1, day);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const formattedDate = date.toLocaleDateString('en-US', options);
      return `📄 Prescription · ${formattedDate} at ${formattedTime}`;
    }

    // Check for date patterns like 20251204
    const datePattern = /(\d{4})(\d{2})(\d{2})/;
    const dateMatch = nameWithoutExt.match(datePattern);

    if (dateMatch) {
      const [_, year, month, day] = dateMatch;
      const date = new Date(year, month - 1, day);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const formattedDate = date.toLocaleDateString('en-US', options);

      // Try to extract any doctor name if present
      let doctorPart = nameWithoutExt
        .replace(datePattern, '')
        .replace(/[_\-]/g, ' ')
        .trim();
      if (doctorPart) {
        // Capitalize first letter of each word
        doctorPart = doctorPart
          .split(' ')
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(' ');
        return `📄 ${doctorPart} · ${formattedDate}`;
      }
      return `📄 Prescription · ${formattedDate}`;
    }

    // If no pattern matches, clean up the filename
    let cleaned = nameWithoutExt
      .replace(/[_\-]/g, ' ') // Replace underscores and hyphens with spaces
      .replace(/\s+/g, ' ') // Remove multiple spaces
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
      .trim();

    // Capitalize first letter of each word
    cleaned = cleaned
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // If cleaned is too long, truncate it
    if (cleaned.length > 30) {
      cleaned = cleaned.substring(0, 27) + '...';
    }

    return `📄 ${cleaned}`;
  }

  // Initialize toast and loading managers
  const toast = new ToastManager(toastContainer);
  const loader = new LoadingManager(loadingOverlay, loadingText);

  // Add loading state to cards
  function setCardLoading(cardId, isLoading) {
    const card = document.querySelector(`.pres-card[data-id="${cardId}"]`);
    if (card) {
      if (isLoading) {
        card.classList.add('loading');
      } else {
        card.classList.remove('loading');
      }
    }
  }

  // Load user from localStorage on page load
  function loadUserFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        currentUser = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  // Save user to localStorage
  function saveUserToStorage(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Hamburger toggle with touch optimization
  hamburgerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sidebar.classList.toggle('collapsed');
  });

  hamburgerBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    sidebar.classList.toggle('collapsed');
  });

  // Close sidebar on mobile when clicking outside (optional)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        sidebar.classList.add('collapsed');
      }
    }
  });

  // Helper: show/hide messages
  function setAuthError(msg) {
    if (msg) {
      authMessage.innerText = msg;
      authMessage.classList.remove('hidden');
      authSuccess.classList.add('hidden');
      toast.error(msg, 'Authentication Error');
    } else {
      authMessage.classList.add('hidden');
    }
  }

  function setAuthSuccess(msg) {
    if (msg) {
      authSuccess.innerText = msg;
      authSuccess.classList.remove('hidden');
      authMessage.classList.add('hidden');
      toast.success(msg, 'Success');
    } else {
      authSuccess.classList.add('hidden');
    }
  }

  // Update sidebar stats
  function updateSidebarStats() {
    if (!currentUser || allFiles.length === 0) {
      totalFilesStat.innerText = allFiles.length;
      uniqueDoctorsStat.innerText = '0';
      doctorListContainer.innerHTML =
        '<div class="doctor-item"><span class="doctor-name">No data</span><span class="doctor-count">-</span></div>';
      return;
    }

    // Total files
    totalFilesStat.innerText = allFiles.length;

    // Count by doctor
    const doctorCounts = {};
    allFiles.forEach((f) => {
      const doc = f.doctor || 'Unknown';
      doctorCounts[doc] = (doctorCounts[doc] || 0) + 1;
    });

    uniqueDoctorsStat.innerText = Object.keys(doctorCounts).length;

    // Build doctor list
    const sortedDocs = Object.entries(doctorCounts).sort((a, b) => b[1] - a[1]);
    doctorListContainer.innerHTML = sortedDocs
      .map(
        ([doc, count]) => `
              <div class="doctor-item">
                <span class="doctor-name">${doc}</span>
                <span class="doctor-count">${count}</span>
              </div>
            `,
      )
      .join('');

    if (sortedDocs.length === 0) {
      doctorListContainer.innerHTML =
        '<div class="doctor-item"><span class="doctor-name">No doctors</span><span class="doctor-count">-</span></div>';
    }
  }

  // Filter and sort functions
  function updateYearFilterOptions() {
    const years = new Set();
    allFiles.forEach((file) => {
      if (file.date) {
        const year = file.date.split('-')[0];
        years.add(year);
      }
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);
    yearFilter.innerHTML =
      '<option value="all">All Years</option>' +
      sortedYears
        .map((year) => `<option value="${year}">${year}</option>`)
        .join('');
  }

  function filterAndSortFiles() {
    if (!allFiles.length) {
      filteredFiles = [];
      return;
    }

    // Apply search filter
    const searchTerm = searchInput.value.toLowerCase();
    let filtered = allFiles.filter((file) => {
      const matchesSearch =
        (file.doctor && file.doctor.toLowerCase().includes(searchTerm)) ||
        (file.filename && file.filename.toLowerCase().includes(searchTerm)) ||
        formatFilename(file.filename).toLowerCase().includes(searchTerm);
      return matchesSearch;
    });

    // Apply year filter
    const selectedYear = yearFilter.value;
    if (selectedYear !== 'all') {
      filtered = filtered.filter(
        (file) => file.date && file.date.startsWith(selectedYear),
      );
    }

    // Apply sorting
    const sortOption = sortSelect.value;
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return (b.date || '').localeCompare(a.date || '');
        case 'oldest':
          return (a.date || '').localeCompare(b.date || '');
        case 'doctor-asc':
          return (a.doctor || '').localeCompare(b.doctor || '');
        case 'doctor-desc':
          return (b.doctor || '').localeCompare(a.doctor || '');
        case 'filename-asc':
          return (a.filename || '').localeCompare(b.filename || '');
        case 'filename-desc':
          return (b.filename || '').localeCompare(a.filename || '');
        default:
          return 0;
      }
    });

    filteredFiles = filtered;
  }

  function renderPrescriptions() {
    filterAndSortFiles();

    if (filteredFiles.length === 0) {
      prescriptionsDiv.innerHTML = '';
      emptyMsg.style.display = 'block';
      return;
    }

    emptyMsg.style.display = 'none';
    prescriptionsDiv.innerHTML = filteredFiles
      .map(
        (f) => `
              <div class="pres-card" data-id="${f.id}">
                <div class="filename">${formatFilename(f.filename)}</div>
                <div class="pres-meta">
                  <span><strong>👨‍⚕️</strong> ${f.doctor || '—'}</span>
                  <span><strong>📅</strong> ${f.date || '—'}</span>
                </div>
                <div class="card-actions">
                  <button class="btn-icon view-btn" data-metaid="${f.id}">👁 view</button>
                  <button class="btn-icon edit" data-metaid="${f.id}">✎ edit</button>
                  <button class="btn-icon delete" data-metaid="${f.id}">✕ delete</button>
                </div>
                <div class="edit-row hidden" id="edit-${f.id}">
                  <input type="text" id="edit-doctor-${f.id}" placeholder="doctor" value="${f.doctor || ''}">
                  <input type="date" id="edit-date-${f.id}" value="${f.date || ''}">
                  <div class="flex">
                    <button class="btn-icon save-edit" data-id="${f.id}">save</button>
                    <button class="btn-icon cancel-edit" data-id="${f.id}">cancel</button>
                  </div>
                </div>
              </div>
            `,
      )
      .join('');
  }

  // render UI based on currentUser
  function refreshUI() {
    const loggedIn = !!currentUser;
    if (loggedIn) {
      authCard.classList.add('hidden');
      mainApp.classList.remove('hidden');
      // sidebar
      sidebarUserProfile.style.display = 'block';
      sidebarStats.style.display = 'block';
      sidebarFooter.style.display = 'block';
      sidebarGuest.style.display = 'none';
      sidebarUserName.innerText = currentUser.email.split('@')[0];
      sidebarUserEmail.innerText = currentUser.email;
      loadPrescriptions();
    } else {
      authCard.classList.remove('hidden');
      mainApp.classList.add('hidden');
      sidebarUserProfile.style.display = 'none';
      sidebarStats.style.display = 'none';
      sidebarFooter.style.display = 'none';
      sidebarGuest.style.display = 'block';
      // default to login tab
      showLoginTab();
      setAuthError(null);
      setAuthSuccess(null);
      allFiles = [];
      filteredFiles = [];
      updateSidebarStats();
    }
  }

  // tab switching
  function showLoginTab() {
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    forgotContainer.style.display = 'none';
    setAuthError(null);
  }

  function showSignupTab() {
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    forgotContainer.style.display = 'none';
    setAuthError(null);
  }

  tabLogin.addEventListener('click', showLoginTab);
  tabLogin.addEventListener('touchend', (e) => {
    e.preventDefault();
    showLoginTab();
  });

  tabSignup.addEventListener('click', showSignupTab);
  tabSignup.addEventListener('touchend', (e) => {
    e.preventDefault();
    showSignupTab();
  });

  // Forgot flow
  document
    .getElementById('forgotPasswordBtn')
    .addEventListener('click', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      signupForm.style.display = 'none';
      forgotContainer.style.display = 'block';
      stepEmailDiv.style.display = 'block';
      stepTokenDiv.style.display = 'none';
      setAuthError(null);
    });

  document
    .getElementById('forgotPasswordBtn')
    .addEventListener('touchend', (e) => {
      e.preventDefault();
      loginForm.style.display = 'none';
      signupForm.style.display = 'none';
      forgotContainer.style.display = 'block';
      stepEmailDiv.style.display = 'block';
      stepTokenDiv.style.display = 'none';
      setAuthError(null);
    });

  document
    .getElementById('backToLoginFromReset')
    .addEventListener('click', (e) => {
      e.preventDefault();
      forgotContainer.style.display = 'none';
      loginForm.style.display = 'block';
    });

  document.getElementById('backToEmail').addEventListener('click', (e) => {
    e.preventDefault();
    stepTokenDiv.style.display = 'none';
    stepEmailDiv.style.display = 'block';
  });

  document
    .getElementById('sendResetLink')
    .addEventListener('click', async (e) => {
      e.preventDefault();
      const btn = e.currentTarget;

      const email = resetEmail.value.trim();
      if (!email) return setAuthError('enter email');

      setAuthError(null);
      loader.setButtonLoading(btn, true);

      try {
        await loader.withLoader(async () => {
          const res = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'request failed');

          loader.showSuccess('Link Generated!', 1200);
          setAuthSuccess('reset link generated (check console / demo token)');

          if (data.resetLink) {
            const urlParams = new URLSearchParams(data.resetLink.split('?')[1]);
            const token = urlParams.get('token');
            if (token) {
              stepEmailDiv.style.display = 'none';
              stepTokenDiv.style.display = 'block';
              tokenInput.value = token;
            }
          }
        }, 'Sending reset link...');
      } catch (e) {
        setAuthError(e.message);
      } finally {
        loader.setButtonLoading(btn, false);
      }
    });

  document
    .getElementById('resetPassBtn')
    .addEventListener('click', async (e) => {
      e.preventDefault();
      const btn = e.currentTarget;

      const token = tokenInput.value.trim();
      const pwd = newPass.value;
      const conf = confirmPass.value;

      if (!token || !pwd || !conf) return setAuthError('fill all fields');
      if (pwd !== conf) return setAuthError('passwords mismatch');

      loader.setButtonLoading(btn, true);

      try {
        await loader.withLoader(async () => {
          const res = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              password: pwd,
              confirmPassword: conf,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'reset failed');

          loader.showSuccess('Password Updated!', 1500);
          setAuthSuccess('password updated! please login');

          setTimeout(() => {
            forgotContainer.style.display = 'none';
            loginForm.style.display = 'block';
            stepEmailDiv.style.display = 'block';
            stepTokenDiv.style.display = 'none';
          }, 1500);
        }, 'Resetting password...');
      } catch (e) {
        setAuthError(e.message);
      } finally {
        loader.setButtonLoading(btn, false);
      }
    });

  // login
  document.getElementById('loginBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = e.currentTarget;

    const email = loginEmail.value.trim();
    const pass = loginPassword.value;

    if (!email || !pass) {
      setAuthError('enter credentials');
      return;
    }

    loader.setButtonLoading(btn, true);

    try {
      await loader.withLoader(async () => {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'login failed');

        currentUser = { id: data.id, email: data.email };
        saveUserToStorage(currentUser);

        loader.showSuccess('Welcome!', 1000);

        setTimeout(() => {
          refreshUI();
          toast.success(
            `Welcome back, ${email.split('@')[0]}!`,
            'Login Successful',
          );
        }, 1000);
      }, 'Logging in...');
    } catch (e) {
      setAuthError(e.message);
    } finally {
      loader.setButtonLoading(btn, false);
    }
  });

  // login with touch
  document
    .getElementById('loginBtn')
    .addEventListener('touchend', async (e) => {
      e.preventDefault();
      const btn = e.currentTarget;

      const email = loginEmail.value.trim();
      const pass = loginPassword.value;

      if (!email || !pass) {
        setAuthError('enter credentials');
        return;
      }

      loader.setButtonLoading(btn, true);

      try {
        await loader.withLoader(async () => {
          const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: pass }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'login failed');

          currentUser = { id: data.id, email: data.email };
          saveUserToStorage(currentUser);

          loader.showSuccess('Welcome!', 1000);

          setTimeout(() => {
            refreshUI();
            toast.success(
              `Welcome back, ${email.split('@')[0]}!`,
              'Login Successful',
            );
          }, 1000);
        }, 'Logging in...');
      } catch (e) {
        setAuthError(e.message);
      } finally {
        loader.setButtonLoading(btn, false);
      }
    });

  // signup
  document.getElementById('signupBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = e.currentTarget;

    const email = signupEmail.value.trim();
    const pass = signupPassword.value;

    if (!email || !pass) {
      setAuthError('email & password');
      return;
    }

    loader.setButtonLoading(btn, true);

    try {
      await loader.withLoader(async () => {
        const res = await fetch(`${API_BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'signup failed');

        loader.showSuccess('Account Created!', 1200);
        setAuthSuccess('account created! please login.');

        setTimeout(() => {
          showLoginTab();
          loginEmail.value = email;
        }, 1200);
      }, 'Creating account...');
    } catch (e) {
      setAuthError(e.message);
    } finally {
      loader.setButtonLoading(btn, false);
    }
  });

  // logout (both buttons)
  function logout() {
    currentUser = null;
    saveUserToStorage(null);
    refreshUI();
    toast.info('You have been logged out', 'Goodbye');
  }

  sidebarLogoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });

  sidebarLogoutBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    logout();
  });

  // file upload
  fileInput.addEventListener('change', () => {
    selectedFileName.innerText = fileInput.files[0]?.name || '';
  });

  document
    .getElementById('fileDropZone')
    .addEventListener('click', () => fileInput.click());
  document.getElementById('fileDropZone').addEventListener('touchend', (e) => {
    e.preventDefault();
    fileInput.click();
  });

  uploadBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = e.currentTarget;

    if (!currentUser) return;

    const file = fileInput.files[0];
    if (!file) {
      toast.warning('Please select a file to upload', 'No File Selected');
      return;
    }

    const doctor = doctorName.value.trim() || 'Unknown';
    const date = prescDate.value || new Date().toISOString().split('T')[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', currentUser.id);
    formData.append('doctor', doctor);
    formData.append('date', date);

    loader.setButtonLoading(btn, true);
    const uploadingToast = toast.info(
      'Uploading your prescription...',
      'Uploading',
      0,
    );

    try {
      await loader.withLoader(async () => {
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'upload error');

        toast.dismiss(uploadingToast);
        loader.showSuccess('Upload Complete!', 1200);

        setTimeout(() => {
          fileInput.value = '';
          selectedFileName.innerText = '';
          doctorName.value = '';
          prescDate.value = date;
          loadPrescriptions();
          toast.success(
            'Your prescription has been uploaded successfully',
            'Upload Complete',
          );
        }, 1200);
      }, 'Uploading prescription...');
    } catch (e) {
      toast.dismiss(uploadingToast);
      toast.error('Upload failed: ' + e.message, 'Upload Failed');
    } finally {
      loader.setButtonLoading(btn, false);
    }
  });

  uploadBtn.addEventListener('touchend', async (e) => {
    e.preventDefault();
    const btn = e.currentTarget;

    if (!currentUser) return;

    const file = fileInput.files[0];
    if (!file) {
      toast.warning('Please select a file to upload', 'No File Selected');
      return;
    }

    const doctor = doctorName.value.trim() || 'Unknown';
    const date = prescDate.value || new Date().toISOString().split('T')[0];

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', currentUser.id);
    formData.append('doctor', doctor);
    formData.append('date', date);

    loader.setButtonLoading(btn, true);
    const uploadingToast = toast.info(
      'Uploading your prescription...',
      'Uploading',
      0,
    );

    try {
      await loader.withLoader(async () => {
        const res = await fetch(`${API_BASE}/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'upload error');

        toast.dismiss(uploadingToast);
        loader.showSuccess('Upload Complete!', 1200);

        setTimeout(() => {
          fileInput.value = '';
          selectedFileName.innerText = '';
          doctorName.value = '';
          prescDate.value = date;
          loadPrescriptions();
          toast.success(
            'Your prescription has been uploaded successfully',
            'Upload Complete',
          );
        }, 1200);
      }, 'Uploading prescription...');
    } catch (e) {
      toast.dismiss(uploadingToast);
      toast.error('Upload failed: ' + e.message, 'Upload Failed');
    } finally {
      loader.setButtonLoading(btn, false);
    }
  });

  // load prescriptions
  async function loadPrescriptions() {
    if (!currentUser) return;

    try {
      await loader.withLoader(async () => {
        const res = await fetch(`${API_BASE}/files?userId=${currentUser.id}`);
        if (!res.ok) throw new Error('failed to fetch');
        const files = await res.json();
        allFiles = files;
        updateYearFilterOptions();
        updateSidebarStats();
        renderPrescriptions();
      }, 'Loading prescriptions...');
    } catch (e) {
      console.error(e);
      toast.error('Failed to load prescriptions', 'Error');
    }
  }

  // Event listeners for search and filter
  searchInput.addEventListener('input', renderPrescriptions);
  yearFilter.addEventListener('change', renderPrescriptions);
  sortSelect.addEventListener('change', renderPrescriptions);

  clearFiltersBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchInput.value = '';
    yearFilter.value = 'all';
    sortSelect.value = 'newest';
    renderPrescriptions();
    toast.info('All filters have been cleared', 'Filters Cleared');
  });

  clearFiltersBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    searchInput.value = '';
    yearFilter.value = 'all';
    sortSelect.value = 'newest';
    renderPrescriptions();
    toast.info('All filters have been cleared', 'Filters Cleared');
  });

  // handle view, edit, delete (delegation) with touch support
  prescriptionsDiv.addEventListener('click', async (e) => {
    await handlePrescriptionAction(e);
  });

  prescriptionsDiv.addEventListener('touchend', async (e) => {
    e.preventDefault();
    await handlePrescriptionAction(e);
  });

  async function handlePrescriptionAction(e) {
    const target = e.target;
    if (!currentUser) return;

    const metaId = target.dataset.metaid;

    if (target.classList.contains('delete') && metaId) {
      e.preventDefault();

      loader.setButtonLoading(target, true);

      try {
        await loader.withLoader(async () => {
          const res = await fetch(`${API_BASE}/file/${metaId}`, {
            method: 'DELETE',
          });
          if (!res.ok) throw new Error();

          loader.showSuccess('Deleted!', 800);

          setTimeout(() => {
            loadPrescriptions();
            toast.success('Prescription has been deleted', 'Delete Complete');
          }, 800);
        }, 'Deleting prescription...');
      } catch {
        toast.error('Failed to delete prescription', 'Delete Failed');
      } finally {
        loader.setButtonLoading(target, false);
      }
    }

    if (target.classList.contains('save-edit')) {
      const id = target.dataset.id;
      loader.setButtonLoading(target, true);

      const doctor = document.getElementById(`edit-doctor-${id}`).value;
      const date = document.getElementById(`edit-date-${id}`).value;

      try {
        await loader.withLoader(async () => {
          const res = await fetch(`${API_BASE}/file/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doctor, date }),
          });
          if (!res.ok) throw new Error();

          document.getElementById(`edit-${id}`).classList.add('hidden');
          loader.showSuccess('Updated!', 800);

          setTimeout(() => {
            loadPrescriptions();
            toast.success('Prescription updated successfully', 'Edit Complete');
          }, 800);
        }, 'Updating...');
      } catch {
        toast.error('Failed to update prescription', 'Edit Failed');
      } finally {
        loader.setButtonLoading(target, false);
      }
      return;
    }

    if (!metaId) return;

    if (target.classList.contains('view-btn')) {
      window.open(`${API_BASE}/file/${metaId}`, '_blank');
      toast.info('Opening prescription...', 'View');
    }

    if (target.classList.contains('edit')) {
      document.getElementById(`edit-${metaId}`).classList.toggle('hidden');
    }

    if (target.classList.contains('cancel-edit')) {
      const id = target.dataset.id;
      document.getElementById(`edit-${id}`).classList.add('hidden');
    }
  }

  refreshBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const btn = e.currentTarget;

    loader.setButtonLoading(btn, true);
    await loadPrescriptions();
    loader.setButtonLoading(btn, false);
    toast.info('Prescription list refreshed', 'Refresh Complete');
  });

  refreshBtn.addEventListener('touchend', async (e) => {
    e.preventDefault();
    const btn = e.currentTarget;

    loader.setButtonLoading(btn, true);
    await loadPrescriptions();
    loader.setButtonLoading(btn, false);
    toast.info('Prescription list refreshed', 'Refresh Complete');
  });

  // Initialize: load user from storage first
  loadUserFromStorage();

  // initial UI render
  refreshUI();

  // set today's date as default for date picker
  const today = new Date().toISOString().split('T')[0];
  if (prescDate) prescDate.value = today;

  // Welcome toast for returning users
  if (currentUser) {
    setTimeout(() => {
      toast.success(
        `Welcome back, ${currentUser.email.split('@')[0]}!`,
        'Hello',
      );
    }, 500);
  }
})();
