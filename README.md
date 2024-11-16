# API Express.js dengan Prisma

Proyek ini adalah API RESTful yang dibangun menggunakan Express.js dengan Prisma sebagai ORM untuk berinteraksi dengan database.

## Pendahuluan
Petunjuk ini akan membantu Anda menyiapkan dan menjalankan proyek di komputer lokal untuk keperluan pengembangan dan pengujian.

## Prasyarat
- [Node.js](https://nodejs.org/) (versi 14 atau lebih tinggi)
- [npm](https://www.npmjs.com/)
- [Prisma CLI](https://www.prisma.io/docs/reference/api-reference/command-reference) (`npx prisma`)
- Database menggunakan MySQL yang didukung Prisma

## Instalasi
1. Clone repositori ini:

   `git clone https://github.com/Rulyrahman/Sumod-BE.git`

   `cd Sumod-BE`

2. Instal dependensi
    ```bash
        npm install
    ```

3. Buat file .env dengan ubah file `.env.example` menjadi `.env`

4. Generate dan migrasi Database
    ```bash
        npx prisma generate
    ```
    ```bash
        npx prisma migrate dev --name init
    ``` 

5. Jalankan aplikasi
    ```bash
        npm run dev
    ```