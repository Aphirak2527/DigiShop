# PremShop — ร้านค้าดิจิทัล Setup Guide

## ภาพรวม

PremShop คือเว็บแอปขายบัญชีดิจิทัลพรีเมียม (Streaming, OTP) สร้างด้วย React + Vite + Supabase รองรับ Vercel deployment

---

## ขั้นตอนการติดตั้ง

### 1. ตั้งค่า Supabase

1. สมัครบัญชี [Supabase](https://supabase.com) และสร้าง Project ใหม่
2. ไปที่ **SQL Editor** แล้ว run ไฟล์ `supabase-schema.sql` ทั้งหมด
3. ไปที่ **Settings > API** คัดลอก:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

#### ตั้งค่า Storage (สำหรับอัพโหลด Slip)

ไปที่ **Storage** > สร้าง bucket ชื่อ `slips` และ `product-images` แล้วตั้งเป็น **Public**

#### ตั้งค่า Admin

หลังสมัครสมาชิกคนแรก ไปที่ **Table Editor > profiles** แล้วเปลี่ยน `role` จาก `user` เป็น `admin`

---

### 2. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ folder `artifacts/premshop/`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxx
```

---

### 3. รันในเครื่อง

```bash
# ติดตั้ง dependencies
pnpm install

# รัน dev server
pnpm --filter @workspace/premshop run dev
```

---

### 4. Deploy บน Vercel

1. Push โค้ดขึ้น GitHub
2. สร้าง Project ใหม่ใน [Vercel](https://vercel.com)
3. เชื่อมต่อ GitHub repo
4. ตั้งค่าใน Vercel dashboard:
   - **Root Directory**: `artifacts/premshop`
   - **Framework Preset**: Vite
   - **Build Command**: ปล่อยว่างไว้ (ใช้จาก vercel.json)
   - **Output Directory**: `dist/public`
5. เพิ่ม **Environment Variables**:
   - `VITE_SUPABASE_URL` = Project URL ของ Supabase
   - `VITE_SUPABASE_ANON_KEY` = anon key ของ Supabase
6. กด **Deploy**

---

## โครงสร้างระบบ

| หน้า | รายละเอียด |
|------|------------|
| `/` | หน้าแรก: Flash Sale, สินค้า, ประกาศ |
| `/products` | รายการสินค้าทั้งหมด |
| `/product/:id` | รายละเอียดสินค้า + ซื้อ |
| `/login` | เข้าสู่ระบบ |
| `/register` | สมัครสมาชิก |
| `/dashboard` | โปรไฟล์ + ยอดเงิน |
| `/topup` | เติมเงิน (อัพโหลด Slip) |
| `/history` | ประวัติการสั่งซื้อ |
| `/announcements` | ประกาศข่าวสาร |
| `/tickets` | แจ้งปัญหา |
| `/admin` | แผงควบคุม Admin |
| `/admin/products` | จัดการสินค้า |
| `/admin/categories` | จัดการหมวดหมู่ |
| `/admin/users` | จัดการผู้ใช้ |
| `/admin/orders` | จัดการคำสั่งซื้อ |
| `/admin/announcements` | จัดการประกาศ |
| `/admin/topup` | อนุมัติการเติมเงิน |

---

## Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel
- **State**: TanStack Query (React Query)
- **Routing**: Wouter
