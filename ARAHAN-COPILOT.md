Pastikan website terminal saya ini hanya menggunakan bahasa English US sahaja.


Awak tolong pastikan sistem Sign in/Login , Sign Up/Register ada di dalam website terminal saya ini ya.  Yang perlu ada ialah : Sign in Google OAuth, Sign in with GitHub, Sign in/Sign up with Email + Password, Sign in/Sign Up with Username + Password, Butang Create New Account dan Forgot Password dalam bentuk text link(Gunakan Email untuk Pengguna Klik sahkan atau verification by klik link di email sahaja yang dihantar secara automatik oleh worker.)

Senarai code email untuk worker ialah Email OTP, Welcome email(setiap kali pelanggan baharu log masuk), Verify Account(New User, Set new password & Forgot Password), Magic Link, Promotional Email, 

Untuk Register Form page :

[Username]
{username}

FullName 
{full_name}

Phone
{MY+60 | 123456789}

Set-up Password
[_________________]

re-type Password
[_________________]

[awak tolong buatkan bahagian Text bagitahu pelanggan yang password minimum 8 huruf, angka, Simbol sahaja
[_] Dengan Teruskan, Pengguna setuju dengan Terma & Syarat yang telah ditetapkan oleh pihak pembangun mengikut Privacy & Policy. (Bahasa english)
- Buatkan juga Halaman untuk Forgot Password contoh ;

Enter Old Password
[enter old password]

New Password
[enter here ]
re-Enter Password
[here.     ]

[ Continue ] - butang untuk worker send kod OTP kepada pengguna di email. Selepas pengguna click butang continue terus munculkan bahagian kotak PIN OTP bersama butang mohon OTP baru jika pelanggan tak terima contoh [ Request New 60 s]

Contoh bahagian OTP Box

[___][___][___][___][___][___]
Not receive OTP? Request New 60s - 60 saat.

[ Continue] - Butang

- Buatkan juga Massage Text selama 2 saat dan hilang automatik, text untuk beritahu pelanggan yang One-Time Password (OTP) telah di hantar ke alamat Email anda. Sila periksa peti Log Masuk atau SPAM/JUNK.(bahasa english)

Tolong buatkan loading pages ke dalam butang continue ya bersama progress text. Selepas habis loading bar di butang baru worker akan send email OTP kepada pelanggan.


Dan awak tolong saya buatkan Code untuk Email Template untuk saya paste ke dalam Cloudflare editor

Buatkan 1 folder khas bersarang untuk bernama  cloudflare-code


Contoh

Tolong buatkan juga Cara-cara untuk saya pasang di cloudflare worker macam mana, nama file apa yang saya kena letak, di Add variable and secret di worker saya kena tambah apa, nama apa, dan ajarkan cara supaya cloudflare worker boleh bersambung dengan Github supaya pengguna dapat Terima OTP semasa register akaun di terminal saya.
Cloudflare
| -> {nama_file_code
| -> README.md (Arahan atau terangkan guna)
{dan file-file code yang lain bagi awak yang perlu ada di cloudflare}