# DigiShop

## ภาพรวม

DigiShop เป็นเว็บแอปพลิเคชันสำหรับขายบัญชีดิจิทัลพรีเมียม (เช่น Streaming, OTP) ที่พัฒนาขึ้นด้วยเทคโนโลยีสมัยใหม่ เพื่อมอบประสบการณ์การใช้งานที่รวดเร็วและมีประสิทธิภาพ ทั้งสำหรับผู้ดูแลระบบและผู้ใช้งานทั่วไป แอปพลิเคชันนี้รองรับการปรับใช้บน Vercel ได้อย่างง่ายดาย

## คุณสมบัติหลัก

*   **ระบบจัดการสินค้า:** เพิ่ม, แก้ไข, ลบสินค้าดิจิทัล
*   **ระบบจัดการหมวดหมู่:** จัดการหมวดหมู่สินค้าเพื่อความเป็นระเบียบ
*   **ระบบจัดการผู้ใช้:** ดูแลข้อมูลผู้ใช้และบทบาท (user/admin)
*   **ระบบจัดการคำสั่งซื้อ:** ติดตามและจัดการคำสั่งซื้อของลูกค้า
*   **ระบบประกาศ:** สร้างและจัดการประกาศข่าวสารสำหรับผู้ใช้
*   **ระบบเติมเงิน:** รองรับการเติมเงินผ่านการอัปโหลดสลิป พร้อมระบบอนุมัติโดยผู้ดูแล
*   **หน้าแดชบอร์ด:** แสดงภาพรวมข้อมูลสำคัญสำหรับผู้ใช้และผู้ดูแลระบบ
*   **ประวัติการสั่งซื้อ:** ผู้ใช้สามารถดูประวัติการซื้อของตนเองได้
*   **ระบบแจ้งปัญหา:** ผู้ใช้สามารถเปิดตั๋วแจ้งปัญหาได้

## เทคโนโลยีที่ใช้ (Tech Stack)

*   **Frontend:** React 18, Vite, TypeScript
*   **Styling:** Tailwind CSS, shadcn/ui
*   **Backend/Database:** Supabase (PostgreSQL, Authentication, Storage)
*   **Hosting:** Vercel
*   **State Management:** TanStack Query (React Query)
*   **Routing:** Wouter

## การติดตั้งและใช้งาน (Setup Guide)

### 1. ตั้งค่า Supabase

1.  สมัครบัญชี [Supabase](https://supabase.com) และสร้างโปรเจกต์ใหม่
2.  ไปที่ **SQL Editor** และรันสคริปต์ทั้งหมดจากไฟล์ `supabase-schema.sql` เพื่อสร้างโครงสร้างฐานข้อมูลและข้อมูลเริ่มต้น
3.  ไปที่ **Settings > API** และคัดลอกค่าต่อไปนี้:
    *   `Project URL` → ใช้สำหรับ `VITE_SUPABASE_URL`
    *   `anon public` key → ใช้สำหรับ `VITE_SUPABASE_ANON_KEY`

#### การตั้งค่า Storage (สำหรับอัปโหลด Slip และรูปภาพสินค้า)

ไปที่ **Storage** > สร้าง bucket ชื่อ `slips` และ `product-images` และตั้งค่าให้เป็น **Public**

#### การตั้งค่า Admin

หลังจากผู้ใช้คนแรกสมัครสมาชิกแล้ว ให้ไปที่ **Table Editor > profiles** และเปลี่ยน `role` ของผู้ใช้คนนั้นจาก `user` เป็น `admin`

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์ `artifacts/premshop/` และเพิ่มค่าดังต่อไปนี้:

```env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ[your-anon-key]xxxxxx
```

### 3. รันในเครื่อง (Local Development)

เปิด Terminal ในรูทของโปรเจกต์และรันคำสั่ง:

```bash
# ติดตั้ง dependencies ทั้งหมด
pnpm install

# รัน development server สำหรับ PremShop
pnpm --filter @workspace/premshop run dev
```

### 4. การ Deploy บน Vercel

1.  Push โค้ดทั้งหมดขึ้น GitHub repository ของคุณ
2.  สร้างโปรเจกต์ใหม่ใน [Vercel](https://vercel.com)
3.  เชื่อมต่อกับ GitHub repository ของคุณ
4.  ตั้งค่าใน Vercel dashboard:
    *   **Root Directory**: `artifacts/premshop`
    *   **Framework Preset**: Vite
    *   **Build Command**: ปล่อยว่างไว้ (จะใช้คำสั่งจาก `vercel.json`)
    *   **Output Directory**: `dist/public`
5.  เพิ่ม **Environment Variables**:
    *   `VITE_SUPABASE_URL` = Project URL ของ Supabase
    *   `VITE_SUPABASE_ANON_KEY` = anon key ของ Supabase
6.  กด **Deploy**

## โครงสร้างระบบ (System Structure)

| หน้า (Page) | รายละเอียด (Description) |
| :---------- | :----------------------- |
| `/`         | หน้าแรก: Flash Sale, สินค้าแนะนำ, ประกาศ |
| `/products` | รายการสินค้าทั้งหมด |
| `/product/:id` | รายละเอียดสินค้าและหน้าสำหรับสั่งซื้อ |
| `/login`    | หน้าเข้าสู่ระบบ |
| `/register` | หน้าสมัครสมาชิก |
| `/dashboard` | แดชบอร์ดผู้ใช้: โปรไฟล์และยอดเงิน |
| `/topup`    | หน้าเติมเงิน (อัปโหลดสลิป) |
| `/history`  | ประวัติการสั่งซื้อ |
| `/announcements` | หน้าประกาศข่าวสาร |
| `/tickets`  | หน้าแจ้งปัญหา/ติดต่อสนับสนุน |
| `/admin`    | แผงควบคุมผู้ดูแลระบบ |
| `/admin/products` | จัดการสินค้า (สำหรับ Admin) |
| `/admin/categories` | จัดการหมวดหมู่ (สำหรับ Admin) |
| `/admin/users` | จัดการผู้ใช้ (สำหรับ Admin) |
| `/admin/orders` | จัดการคำสั่งซื้อ (สำหรับ Admin) |
| `/admin/announcements` | จัดการประกาศ (สำหรับ Admin) |
| `/admin/topup` | อนุมัติการเติมเงิน (สำหรับ Admin) |

## การมีส่วนร่วม (Contributing)

ยินดีต้อนรับการมีส่วนร่วม! หากคุณต้องการปรับปรุงหรือแก้ไขโปรเจกต์นี้ โปรด fork repository และส่ง Pull Request

## ลิขสิทธิ์ (License)

โปรเจกต์นี้อยู่ภายใต้ลิขสิทธิ์ MIT License. ดูรายละเอียดเพิ่มเติมในไฟล์ `LICENSE` (หากมี) หรือใน GitHub repository
