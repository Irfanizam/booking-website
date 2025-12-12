# Database Location and Storage

## 📁 Database Files Location

All database files are stored in the `backend` directory:

```
backend/
├── BookingDb/
│   ├── bookings.db          ← All booking data stored here
│   └── init_booking.js      ← Booking database initialization script
├── Merchantdb/
│   ├── merchant.db          ← All merchant/business data stored here
│   └── init.js              ← Merchant database initialization script
└── uploads/                  ← Image uploads (logos, cover photos)
    ├── logo-*.jpeg
    └── cover_photo-*.png
```

## 🗄️ Database Details

### 1. Bookings Database (`backend/BookingDb/bookings.db`)
**Location:** `backend/BookingDb/bookings.db`

**Contains:**
- All booking records
- Customer information
- Booking dates and times
- Service details
- Booking status
- Staff assignments
- Notes and additional information

**Tables:**
- `bookings` - Main bookings table

**To view data:**
```bash
# Using SQLite command line
cd backend/BookingDb
sqlite3 bookings.db
.tables
SELECT * FROM bookings;
```

### 2. Merchant Database (`backend/Merchantdb/merchant.db`)
**Location:** `backend/Merchantdb/merchant.db`

**Contains:**
- Merchant/business information
- Services offered
- Staff members
- Working hours
- User accounts (authentication)
- Business settings

**Tables:**
- `merchants` - Business information
- `services` - Services offered by merchants
- `staff` - Staff members
- `working_hours` - Business hours
- `users` - User accounts for login

**To view data:**
```bash
# Using SQLite command line
cd backend/Merchantdb
sqlite3 merchant.db
.tables
SELECT * FROM users;
SELECT * FROM merchants;
```

## 📊 Database Type

Both databases use **SQLite**, which means:
- ✅ No separate database server needed
- ✅ Data stored in single files (`.db` files)
- ✅ Easy to backup (just copy the `.db` files)
- ✅ Portable and lightweight
- ✅ Perfect for development and small-medium applications

## 🔄 Database Initialization

### First Time Setup:
```bash
cd backend

# Initialize merchant database
npm run db:init
# OR
node Merchantdb/init.js

# Initialize bookings database
node BookingDb/init_booking.js
```

### Reset Databases (⚠️ Deletes all data):
```bash
# Delete database files
rm backend/BookingDb/bookings.db
rm backend/Merchantdb/merchant.db

# Reinitialize
npm run db:init
node BookingDb/init_booking.js
```

## 📦 Backup and Restore

### Backup Databases:
```bash
# Copy database files to backup location
cp backend/BookingDb/bookings.db backups/bookings_backup_$(date +%Y%m%d).db
cp backend/Merchantdb/merchant.db backups/merchant_backup_$(date +%Y%m%d).db
```

### Restore from Backup:
```bash
# Copy backup files back
cp backups/bookings_backup_YYYYMMDD.db backend/BookingDb/bookings.db
cp backups/merchant_backup_YYYYMMDD.db backend/Merchantdb/merchant.db
```

## 🔍 Viewing Database Content

### Option 1: SQLite Command Line
```bash
# Install SQLite (if not installed)
# Windows: Download from sqlite.org
# Mac: brew install sqlite
# Linux: sudo apt-get install sqlite3

# Open database
sqlite3 backend/BookingDb/bookings.db

# View tables
.tables

# View bookings
SELECT * FROM bookings;

# Exit
.quit
```

### Option 2: SQLite Browser (GUI)
1. Download DB Browser for SQLite: https://sqlitebrowser.org/
2. Open the `.db` file
3. Browse tables and data visually

### Option 3: VS Code Extension
1. Install "SQLite Viewer" extension in VS Code
2. Right-click on `.db` file
3. Select "Open Database"

## 📝 Important Notes

1. **Database files are created automatically** when you run the initialization scripts
2. **Don't delete database files** unless you want to lose all data
3. **Backup regularly** before making major changes
4. **Database files are included in `.gitignore`** - they won't be committed to git
5. **Each database is independent** - bookings and merchants are separate

## 🚨 Troubleshooting

### Database locked error:
- Close all connections to the database
- Restart the backend server
- Check if another process is using the database

### Database not found:
- Run initialization scripts
- Check file paths are correct
- Ensure you're in the right directory

### Can't see data:
- Check if data was actually saved
- Verify database file exists
- Check file permissions

## 📍 Full Paths (Windows Example)

```
D:\FreeLance\website\Combined Frontend\Combined Frontend\backend\BookingDb\bookings.db
D:\FreeLance\website\Combined Frontend\Combined Frontend\backend\Merchantdb\merchant.db
```

## 🔐 Security Note

- Database files contain sensitive information
- Don't commit them to version control
- Keep backups secure
- Use proper file permissions in production

