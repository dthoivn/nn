SMART CLASS QUICK - FIREBASE + GITHUB PAGES

QUAN TRONG
- GitHub Pages la website cong khai ve ma nguon; khong dua du lieu hoc sinh vao repository.
- Firebase Authentication + Firestore Rules bao ve du lieu. Chi tai khoan da duoc tao moi dang nhap duoc.
- Khong bat tinh nang dang ky cong khai trong ung dung.
- firebase-config.js chua Firebase web config; apiKey web khong phai mat khau. Bao ve du lieu bang Security Rules.

A. TAO FIREBASE
1. Vao https://console.firebase.google.com/ va tao project.
2. Them Web App (</>), sao chep firebaseConfig.
3. Authentication > Sign-in method > bat Email/Password.
4. Authentication > Users > Add user: tao tai khoan email/mat khau cho giao vien.
5. Firestore Database > Create database.
6. Chon Production mode.
7. Vao tab Rules, dan noi dung file firestore.rules, bam Publish.

B. CAU HINH
1. Mo firebase-config.js.
2. Thay cac chuoi PASTE_... bang gia tri tu Firebase Console > Project settings > General > Your apps > SDK setup and configuration > Config.
3. Luu file.

C. DANG LEN GITHUB PAGES
1. Tao repository GitHub, vi du smart-class-quick.
2. Upload cac file trong thu muc Smart_Class_Quick_Tin_Hoc vao root repository:
   index.html, app.js, style.css, firebase-config.js, firebase-sync.js.
   firestore.rules va README.txt co the de trong repo.
3. GitHub > repository > Settings > Pages.
4. Build and deployment: Deploy from a branch.
5. Branch: main; Folder: /(root); Save.
6. Doi GitHub tao URL https://TEN-TAI-KHOAN.github.io/TEN-REPO/

D. SU DUNG
- Mo URL Pages tren cac thiet bi, dang nhap cung mot tai khoan Firebase.
- Thay doi du lieu se tu dong dong bo qua Firestore.
- Lan dau dang nhap tren trinh duyet chua co du lieu: ung dung se tai du lieu local cua trinh duyet do len Firestore.
- Neu Firestore da co du lieu: du lieu tren cloud se duoc nap vao trinh duyet.
- Nen xuat TXT sao luu truoc khi bat dau dong bo lan dau.

E. CHUYEN DU LIEU TU PHIEN BAN CU
1. Mo phien ban cu tren may co du lieu.
2. Bam Xuat TXT de sao luu.
3. Mo ban GitHub Pages, dang nhap tai khoan Firebase.
4. Neu cloud chua co du lieu, no se nap du lieu LocalStorage hien tai len cloud.
5. Cac may khac dang nhap cung tai khoan se nhan du lieu cloud.

GHI CHU KY THUAT
- Firebase config khong chua private key.
- Khong chia se tai khoan giao vien. Tao tai khoan rieng neu can phan quyen nhieu giao vien.
- Ban hien tai dung mot tai lieu Firestore cho moi tai khoan; phu hop lop hoc quy mo nho/vua. Khi tang quy mo, nen chuyen sang collection theo hoc sinh/diem.
- Can Internet de dong bo; khi offline, ban nay van luu LocalStorage tren may do nhung se can thao tac sua de day lai khi ket noi.
