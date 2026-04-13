import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const equalsIndex = line.indexOf('=');
    if (equalsIndex <= 0) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    let value = line.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve('.env'));
loadEnvFile(path.resolve('.env.local'));

const students10 = [
  "Abdukarimov Qodir Jamshid o'g'li",
  "Donaboyeva Maftuna Mehzod qizi",
  "Ernazarov Erkin Abdurashid o'g'li",
  "Ga'ybullayev Abror Ziyodulla o'g'li",
  "Ismoilov Isomiddin Hasan o'g'li",
  "Olimjonov Abduvoris Olimjon o'g'li",
  "Olimjonova Madina Bahodir qizi",
  "Sobirjononv Xusniddin Hasan o'g'li",
  "Sultonboyeva Zarina Rasul qizi",
  "Tugalov Muhammadaziz Abduvahob o'g'li",
  "Usmonov Risqiboy Bahodir o'g'li",
  "Xolmurodov Komiljon Karim o'g'li",
  "Abdujalilov Asrorbek Abror og'li",
  "Anorboyeva Dilshoda Jamol qizi",
  "Avazov Sodiq Alisher o'g'li",
  "Boyxo'rozov Azizbek Xazrat o'g'li",
  "Mamatqulova Ozoda Baxtiyor qizi",
  "Nuriddinov Salohiddin Shodiyor o'g'li",
  "Qurbonbqulova Aziza Turlibek qizi",
  "Shokirov Ilhom Otabek o'g'li",
  "To'ychiboyev Samandar Farhod o'g'li",
  "To'ychiboyeva Bonu Nozimbek qizi",
  "Xakimov Nodirbek Nayimjon o'g'li",
  "Ziyadullayev Abdumannof Xayrulla o'g'li",
];

const students9 = [
  "Abduvaliyev Daler Alisher o'g'li",
  "Ahmadqulova Sevinch Jasur qizi",
  "Bobojonov Arslonbek Baxtiyarovich",
  "Boborahimova Durdona Ibrohim qizi",
  "Jo'rayev Kamoliddin G'afur o'g'li",
  "Mamatqulov Axrorbek Ravshanbek o'g'li",
  "Mirjamolov Sardor Jamshid o'g'li",
  "Norjigitov Avrangzeb G'ayrat o'g'li",
  "Primqulov Umrzoq Odiljon o'g'li",
  "Qosimov Saidmuhammad Baxtiyor o'g'li",
  "Shamiddinova Umida Salohiddin qizi",
  "Shaymardonov Ibrohim Abdulla o'g'li",
  "Ashrafjonova Zilola Akmal qizi",
  "Bahodirov Oybek Otabek o'g'li",
  "Bo'ronov Jasurbek Saidahmad O'g'li",
  "Botirova Mohinur Usmon qizi",
  "Do'stmatova Dildora Umidjon qizi",
  "Eshqo'ziyev Abrorbek Nuriddin o'g'li",
  "Hakimjonov Dilmurod Jamshid o'g'li",
  "Mirzayev Muhammadjon Qurbonovich",
  "Muhitdinova Madinabonu Vohidjon qizi",
  "Qobilov Diyorbek Mirzabek o'g'li",
  "Turg'unboyev Mirkomil Shavkat o'g'li",
  "Xolboyev Asadbek Zoyir o'g'li",
];

const allStudents = [
  ...students10.map((fullName) => ({ fullName, gradeLevel: '10' })),
  ...students9.map((fullName) => ({ fullName, gradeLevel: '9' })),
];

const args = new Set(process.argv.slice(2));
const applyMode = args.has('--apply');
const gradeArg = [...args].find((arg) => arg.startsWith('--grade='));
const gradeFilter = gradeArg ? gradeArg.split('=')[1] : null;
const outputDir = path.resolve('scripts', 'output');
const outputPath = path.join(outputDir, 'student-credentials-latest.csv');

const schoolId = process.env.BULK_STUDENT_SCHOOL_ID ?? 'sch_presidential';
const schoolName = process.env.BULK_STUDENT_SCHOOL_NAME ?? 'Presidential School in Gulistan';
const emailDomain = (process.env.BULK_STUDENT_EMAIL_DOMAIN ?? 'gulps.uz')
  .trim()
  .replace(/^@+/, '')
  .toLowerCase();
const approved = (process.env.BULK_STUDENT_APPROVED ?? 'true').toLowerCase() === 'true';

function normalizeForIdentifier(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/['`’ʼʻ‘]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function parseStudentName(fullName) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) {
    throw new Error(`Cannot parse name: "${fullName}"`);
  }

  return {
    lastName: parts[0],
    firstName: parts[1],
  };
}

function pickRandom(chars) {
  return chars[crypto.randomInt(0, chars.length)];
}

function generatePassword(length = 12) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '@#$%*!?';
  const all = upper + lower + digits + symbols;

  const chars = [
    pickRandom(upper),
    pickRandom(lower),
    pickRandom(digits),
    pickRandom(symbols),
  ];

  while (chars.length < length) {
    chars.push(pickRandom(all));
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
}

function toCsv(rows) {
  const headers = [
    'full_name',
    'grade_level',
    'first_name',
    'last_name',
    'username',
    'email',
    'password',
    'status',
    'error',
  ];

  const escape = (value) => {
    const normalized = value ?? '';
    const stringValue = String(normalized);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function buildCredentialRows(students) {
  const usedUsernames = new Set();
  return students.map((student, idx) => {
    const { firstName, lastName } = parseStudentName(student.fullName);
    const base = `${normalizeForIdentifier(firstName)}_${normalizeForIdentifier(lastName)}`;
    let username = base;
    let suffix = 2;
    while (usedUsernames.has(username)) {
      username = `${base}_${suffix}`;
      suffix += 1;
    }
    usedUsernames.add(username);

    return {
      index: idx + 1,
      fullName: student.fullName,
      firstName,
      lastName,
      gradeLevel: student.gradeLevel,
      username,
      email: `${username}@${emailDomain}`,
      password: generatePassword(),
    };
  });
}

async function run() {
  if (allStudents.length !== 48) {
    throw new Error(`Expected 48 students in source data, found ${allStudents.length}.`);
  }

  const selectedStudents = gradeFilter
    ? allStudents.filter((student) => student.gradeLevel === gradeFilter)
    : allStudents;

  if (selectedStudents.length === 0) {
    throw new Error(
      `No students matched --grade=${gradeFilter}. Use --grade=9 or --grade=10, or omit the flag.`
    );
  }

  const credentialRows = buildCredentialRows(selectedStudents);
  const results = [];

  let supabase = null;
  if (applyMode) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const adminKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !adminKey) {
      throw new Error(
        'Missing env for apply mode. Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.'
      );
    }

    supabase = createClient(supabaseUrl, adminKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  for (const row of credentialRows) {
    if (!applyMode) {
      results.push({
        full_name: row.fullName,
        grade_level: row.gradeLevel,
        first_name: row.firstName,
        last_name: row.lastName,
        username: row.username,
        email: row.email,
        password: row.password,
        status: 'dry_run',
        error: '',
      });
      continue;
    }

    const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
      email: row.email,
      password: row.password,
      email_confirm: true,
      user_metadata: {
        first_name: row.firstName,
        last_name: row.lastName,
        role: 'student',
        grade_level: row.gradeLevel,
      },
    });

    if (createError || !createdUser?.user?.id) {
      results.push({
        full_name: row.fullName,
        grade_level: row.gradeLevel,
        first_name: row.firstName,
        last_name: row.lastName,
        username: row.username,
        email: row.email,
        password: row.password,
        status: 'auth_failed',
        error: createError?.message ?? 'Unknown auth create error',
      });
      continue;
    }

    const userId = createdUser.user.id;

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        first_name: row.firstName,
        last_name: row.lastName,
        email: row.email,
        role: 'student',
        school_id: schoolId,
        school_name: schoolName,
        grade_level: row.gradeLevel,
        approved,
      },
      { onConflict: 'id' }
    );

    results.push({
      full_name: row.fullName,
      grade_level: row.gradeLevel,
      first_name: row.firstName,
      last_name: row.lastName,
      username: row.username,
      email: row.email,
      password: row.password,
      status: profileError ? 'profile_failed' : 'created',
      error: profileError?.message ?? '',
    });
  }

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, toCsv(results), 'utf8');

  const createdCount = results.filter((r) => r.status === 'created').length;
  const dryRunCount = results.filter((r) => r.status === 'dry_run').length;
  const failedCount = results.filter((r) => r.status.endsWith('failed')).length;

  console.log(`Total students: ${results.length}`);
  if (applyMode) {
    console.log(`Created users: ${createdCount}`);
    console.log(`Failed: ${failedCount}`);
  } else {
    console.log(`Dry-run rows: ${dryRunCount}`);
  }
  console.log(`Credentials file: ${outputPath}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
