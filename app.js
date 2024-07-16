// app.js
const morgan = require('morgan');
const express = require('express');  // Express framework'ü
const session = require('express-session');  // Oturum yönetimi için express-session modülü
const passport = require('passport');  // Kullanıcı kimlik doğrulama için Passport.js
const LocalStrategy = require('passport-local').Strategy;  // Passport.js'in yerel kimlik doğrulama stratejisi
const mongoose = require('mongoose');  // MongoDB ile etkileşim için Mongoose
const bcrypt = require('bcryptjs');  // Şifre hashleme için bcryptjs
const flash = require('connect-flash');  // Flash mesajları için connect-flash modülü
const { Pool, Client } = require('pg');  // PostgreSQL ile etkileşim için pg modülü
const redis = require('redis');  // Redis ile etkileşim için redis modülü
const connectRedis = require('connect-redis');  // Redis ile oturum saklama için connect-redis modülü
const path = require('path');  // Dosya yollarını işlemek için path modülü
const app = express();  // Express uygulaması
const amqp = require('amqplib');  // RabbitMQ ile etkileşim için amqplib modülü
const { createClient } = require('redis');  // Bu satır eklenmiştir.

const port = 3000;
const bodyParser = require('body-parser');

const deleteAccountRouter = require('./routes/deleteAccount');


async function main() {
  try {
    // RabbitMQ'ya bağlan
    const connection = await amqp.connect('amqp://localhost');

    // Kanal oluştur
    const channel = await connection.createChannel();

    // Kuyruk oluştur
    const queueName = 'delete-account';
    await channel.assertQueue(queueName, { durable: false });

    // Mesajı gönder
    const message = JSON.stringify({ username: 'username', password: 'password' });
    channel.sendToQueue(queueName, Buffer.from(message));

    console.log('Mesaj RabbitMQ kuyruğuna gönderildi.');

    // Bağlantıyı kapat
    setTimeout(() => {
      connection.close();
    }, 1000);
  } catch (error) {
    console.error('RabbitMQ ile bir hata oluştu:', error);
  }
}

main();


let rabbitMQChannel;

amqp.connect('amqp://localhost')  // RabbitMQ'ya bağlanma
  .then(function(connection) {
    console.log('Connected to RabbitMQ successfully');  // Bağlantı başarılıysa log mesajı
    return connection.createChannel();  // RabbitMQ kanalını oluşturma
  })
  .then(function(channel) {
    console.log('RabbitMQ channel created successfully');  // Kanal oluşturulduysa log mesajı
    rabbitMQChannel = channel;  // Global değişkene kanalı atama
  })
  .catch(function(error) {
    console.error('RabbitMQ connection/channel error:', error.message);  // Hata durumunda log mesajı
    // Burada isteğe bağlı olarak hata durumunu uygun şekilde ele alabilirsiniz.
    throw error;  // veya başka bir işlem yapabilirsiniz.
  });

  const redisClient = createClient({
    host: 'localhost',
    port: 6379,
  });
  
  function connectToRedis() {
    redisClient.connect().catch(function(error) {
      console.error('Could not establish a connection with Redis:', error.message);
      // Burada isteğe bağlı olarak hata durumunu uygun şekilde ele alabilirsiniz.
      throw error; // veya başka bir işlem yapabilirsiniz.
    });
  
    redisClient.on('error', function(err) {
      console.log('Redis connection error:', err.message);
      // Burada isteğe bağlı olarak hata durumunu uygun şekilde ele alabilirsiniz.
      // Örneğin, uygulamanızın durmasını önlemek için uygun bir işlem yapabilirsiniz.
    });
  
    redisClient.on('connect', function() {
      console.log('Connected to Redis successfully');
      // Burada bağlantı başarılı olduğunda yapılacak işlemleri ekleyebilirsiniz.
    });
  }
  
  connectToRedis();
  

// Express session ayarları Redis ile
app.use(session({
  secret: 'your_secret_key',
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: false, // HTTPS kullanıyorsanız true yapın
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // Örneğin 1 gün için
  }
}));

// Redis üzerinde test amaçlı bir anahtar değer çifti set etme
redisClient.set("testKey", "testValue", redis.print);

// Redis üzerinde test amaçlı bir anahtarın değerini getirme
redisClient.get("testKey", (err, reply) => {
    if (err) throw err;
    console.log(reply); // "testValue" döndürmesi beklenir
});


// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/your-mongodb-database',);
const mongoDB = mongoose.connection;

mongoDB.on('error', console.error.bind(console, 'MongoDB connection error:'));


// PostgreSQL bağlantısı
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'myproje',
  password: '148984',
  port: 5432,
}); // PostgreSQL veritabanına bağlanma, gerekli bağlantı bilgileri tanımlanmıştır. // PostgreSQL veritabanına bağlanma, gerekli bağlantı bilgileri tanımlanmıştır.
pool.connect()
  .then(() => {
    console.log('PostgreSQL connected');
  })
  .catch(err => console.error('PostgreSQL connection error:', err));
// RabbitMQ kullanarak mesaj gönderme fonksiyonu
// RabbitMQ kullanarak mesaj gönderme fonksiyonu
async function sendToQueue(queue, message) {
  try {
    rabbitMQChannel.assertQueue(queue, {
      durable: false
    }); // Belirtilen kuyruğu oluştur veya varsa tekrar kullanılabilir duruma getir
    rabbitMQChannel.sendToQueue(queue, Buffer.from(message)); // Mesajı belirtilen kuyruğa gönder
    console.log(`Message sent to RabbitMQ queue: ${queue}`); // Konsola mesaj gönderildiğine dair bilgi yazdır
    console.log(`Message content: ${message}`); // Mesaj içeriğini logla

    // Ek olarak, mesajın içindeki bilgileri PostgreSQL'e ekleyebilirsiniz
    processMessage(message);
  } catch (error) {
    console.error('Error while sending message to RabbitMQ:', error.message);
    // RabbitMQ'ya mesaj gönderirken bir hata olması durumunda konsola hata yazdırma
    // Burada isteğe bağlı olarak hata durumunu uygun şekilde ele alabilirsiniz.
    throw error; // veya başka bir işlem yapabilirsiniz.
  }
}

function processMessage(message) {
  const data = JSON.parse(message);
  const { userId, city, birthdate } = data;

  // PostgreSQL'e ekleme işlemini gerçekleştir
  const query = 'INSERT INTO user_details (user_id, city, birthdate) VALUES ($1, $2, $3)';
  const values = [userId, city, birthdate];

  pool.query(query, values)
    .then(result => {
      console.log('Data inserted into PostgreSQL:', result.rows);
    })
    .catch(error => {
      console.error('Error while inserting data into PostgreSQL:', error);
    });
}


// Model tanımlamaları
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
}));

// Express ayarları
app.use(morgan('dev'));

//
app.use(deleteAccountRouter);

//
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(path.join(__dirname, 'public', 'scripts')));
app.use('/scripts', express.static(path.join(__dirname, 'public/scripts')));



app.set('view engine', 'ejs'); // Express uygulamasında view motorunu belirle (EJS kullanılıyor)
app.use(express.urlencoded({ extended: false })); // URL'den gelen form verilerini işlemek için middleware kullanımı
app.use(passport.initialize()); // Passport kullanımını başlat
app.use(passport.session()); // Passport'ın oturum desteğini etkinleştir
app.use(flash()); // Flash mesajları için middleware kullanımı
app.use('/styles', express.static(path.join(__dirname, 'public/styles')));
// public/styles dizinini statik dosyaları sunmak için kullan

app.set('views', path.join(__dirname, 'views'));
//--------------------------------------------------

// Body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Passport konfigürasyonu
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username }); // Kullanıcı adına göre MongoDB'den kullanıcıyı bul
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' }); // Kullanıcı bulunamazsa hata döndür
      }

      const passwordMatch = await bcrypt.compare(password, user.password); // Girilen şifreyi hashlenmiş şifre ile karşılaştır
      if (passwordMatch) {
        return done(null, user); // Şifre eşleşirse kullanıcıyı doğrulayarak işlemi tamamla
      } else {
        return done(null, false, { message: 'Incorrect password.' }); // Şifre eşleşmezse hata döndür
      }
    } catch (err) {
      return done(err); // Hata durumunda hatayı döndür
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id); // Oturum kullanıcısının kimliğini belirleyen serialize işlemi
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err)); // Kullanıcının kimliğinden yola çıkarak kullanıcıyı bulan deserialize işlemi
});

// app.js içindeki bir kısım
app.post('/add-details', isLoggedIn, async (req, res) => {
  const { username, city, birthdate, gender } = req.body;

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.render('add-details', { error: 'User not found.' });
    }

    const userId = user._id.toString();
    const existingDetail = await pool.query('SELECT * FROM user_details WHERE user_id = $1', [userId]);

    if (existingDetail.rows.length > 0) {
      // Var olan detaylar varsa güncelleme yap
      await pool.query('UPDATE user_details SET city = $1, birthdate = $2, gender = $3 WHERE user_id = $4', [city, birthdate, gender, userId]);
    } else {
      // Yoksa yeni detay ekle
      await pool.query('INSERT INTO user_details (user_id, city, birthdate, gender) VALUES ($1, $2, $3, $4)', [userId, city, birthdate, gender]);
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('add-details', { error: 'An error occurred while adding user details.' });
  }
});


// Cinsiyet seçeneklerini döndüren endpoint
app.get('/public/scripts/get-gender-options', (req, res) => {
  const genderOptions = ['Erkek', 'Kız', 'Belirtmeyi Tercih Etmiyorum'];
  res.json({ options: genderOptions });
});

// Routes
app.get('/', (req, res) => {
  res.render('index', { message: req.flash('error') });
  // Ana sayfa endpoint'i, giriş hatası varsa hatayı eşleşen şablona ileterek sayfayı render eder
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/',
  failureFlash: true,
}));

// Kullanıcı girişi için POST /login endpoint'i, başarılı girişte dashboard sayfasına yönlendirir, başarısız girişte ana sayfaya yönlendirir ve hata mesajını eşleşen şablona ileterek sayfayı render eder

app.get('/register', (req, res) => {
  res.render('register', { message: req.flash('error') });
  // Kayıt sayfası endpoint'i, kayıt hatası varsa hatayı eşleşen şablona ileterek sayfayı render eder
});

app.post('/register', async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  // Şifre doğrulaması kontrolü
  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match'); // Şifre doğrulaması hatası varsa hata mesajını flash ile ayarlar
    return res.redirect('/register'); // Kayıt sayfasına yönlendirir
  }

  try {
    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, password: hash });

    // Save the user to the database
    await newUser.save(); // Yeni kullanıcıyı veritabanına kaydeder

    res.redirect('/'); // Kayıt başarılıysa ana sayfaya yönlendirir
  } catch (err) {
    console.error(err);
    req.flash('error', 'User already exists or an error occurred during registration');
    // Kullanıcı zaten varsa veya kayıt sırasında hata olursa uygun hata mesajını flash ile ayarlar
    res.redirect('/register'); // Kayıt sayfasına yönlendirir
  }
});
app.get('/dashboard', isLoggedIn, async (req, res) => {
  try {
    // PostgreSQL'den kullanıcının mevcut detayını kontrol et
    const userId = req.user._id.toString(); // MongoDB'den gelen _id'yi stringe çevir
    const existingDetail = await pool.query('SELECT * FROM user_details WHERE user_id = $1', [userId]);

    // Mevcut detay varsa, detayları göster
    if (existingDetail.rows.length > 0) {
      res.render('dashboard', { user: req.user, existingDetail: existingDetail.rows[0] });
    } else {
      res.render('dashboard', { user: req.user });
    }
  } catch (err) {
    console.error(err);
    res.render('search-user', { error: 'An error occurred while searching for the user.' });
  }
});

app.get('/add-details', isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const existingDetail = await pool.query('SELECT * FROM user_details WHERE user_id = $1', [userId]);

    if (existingDetail.rows.length > 0) {
      res.render('add-details', { existingDetail: existingDetail.rows[0] });
    } else {
      res.render('add-details');
    }
  } catch (err) {
    console.error(err);
    res.render('add-details', { error: 'An error occurred while fetching user details.' });
  }
});

app.post('/add-details', isLoggedIn, async (req, res) => {
  const { username, city, birthdate } = req.body;

  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.render('add-details', { error: 'User not found.' });
    }

    const userId = user._id.toString();
    const existingDetail = await pool.query('SELECT * FROM user_details WHERE user_id = $1', [userId]);

    if (existingDetail.rows.length > 0) {
      await pool.query('UPDATE user_details SET city = $1, birthdate = $2 WHERE user_id = $3', [city, birthdate, userId]);
    } else {
      await pool.query('INSERT INTO user_details (user_id, city, birthdate) VALUES ($1, $2, $3)', [userId, city, birthdate]);
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('add-details', { error: 'An error occurred while adding user details.' });
  }
});

// Live search route
app.get('/live-search', isLoggedIn, async (req, res) => {
  const query = req.query.query;

  try {
    // MongoDB'den kullanıcıları bul ve sadece gerekli verileri döndür
    const users = await User.find({ username: { $regex: query, $options: 'i' } }, 'username _id');

    res.json(users);
    // Bulunan kullanıcıları JSON formatında döndürür
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred during live search.' });
    // Hata durumunda uygun hata mesajını ve HTTP durum kodunu döndürür
  }
});

app.get('/search-user', isLoggedIn, (req, res) => {
  res.render('search-user');
  // Arama sayfasını render eder
});

// search-user route
// search-user route
app.post('/search-user', isLoggedIn, async (req, res) => {
  const searchedUsername = req.body.searchedUsername;

  try {
    // MongoDB'den kullanıcıyı bul
    const user = await User.findOne({ username: searchedUsername });

    if (!user) {
      console.log('User not found in MongoDB.');
      return res.render('search-user', { error: 'User not found.' });
    }

    console.log('User found in MongoDB:', user);

    // PostgreSQL'den kullanıcının detaylarını ve cinsiyet bilgisini çek
    console.log('Before PostgreSQL query');
    const result = await pool.query('SELECT * FROM user_details WHERE user_id = $1', [user._id.toString()]);

    console.log('Result from PostgreSQL:', result.rows);

    if (result.rows.length > 0) {
      const gender = result.rows[0].gender;
      console.log('User details found in PostgreSQL. Rendering page...');

      return res.render('search-user', { user: user, details: result.rows, gender: gender });
    } else {
      console.log('User details not found in PostgreSQL. Rendering page...');
      return res.render('search-user', { user: user, error: 'User details not found in PostgreSQL.' });
    }
  } catch (err) {
    console.error('An error occurred while searching for the user:', err);
    console.error(err.stack); // Hata yığınındaki tam bilgileri consola yazdır
    return res.render('search-user', { error: 'An error occurred while searching for the user.' });
  }
});

async function deleteUserDetails(userId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); // Transaction başlat
    await client.query('DELETE FROM user_details WHERE user_id = $1', [userId]); // PostgreSQL'de detayları sil
    await client.query('COMMIT'); // Transaction commit
    console.log('Kullanıcı detayları PostgreSQL\'den silindi');
  } catch (error) {
    await client.query('ROLLBACK'); // Hata durumunda geri al
    console.error('Kullanıcı detayları silinirken bir hata oluştu:', error);
    throw error; // Hata durumunu yukarıya iletebilirsiniz
  } finally {
    client.release(); // Client'ı serbest bırak
  }
}


async function deleteUserFromMongoDB(username) {
  try {
    // Kullanıcıyı sil
    await User.deleteOne({ username });
    console.log('Kullanıcı MongoDB\'den silindi');
  } catch (error) {
    console.error('Kullanıcı MongoDB\'den silinirken bir hata oluştu:', error);
    throw error; // Hata durumunu yukarıya iletebilirsiniz
  }
}
app.post('/delete-account', async (req, res) => {
  // Kullanıcı adı ve şifreyi al
  const { username, password } = req.body;

  try {
    // Şifreyi doğrula
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ error: 'Kullanıcı bulunamadı.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: 'Şifre doğrulanamadı. Hesap silinemedi.' });
    }

    // MongoDB'den kullanıcıyı sil
    await User.deleteOne({ username });

    // PostgreSQL'den kullanıcı detaylarını sil
    await deleteUserDetails(user.user_id);

    // Kullanıcı giriş yapmışsa, giriş sayfasına yönlendir
    if (req.session.username) {
      return res.redirect('/login');
    }

    // Başarılıysa veya kullanıcı giriş yapmamışsa, ana sayfaya yönlendirin
    return res.redirect('/');
  } catch (error) {
    console.error('Kullanıcı silinirken bir hata oluştu:', error);
    return res.status(500).json({ error: 'Bir hata oluştu. Hesap silinemedi.' });
  }
});

// Middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
  // Eğer kullanıcı oturum açmamışsa ana sayfaya yönlendirir
}

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Server'ı belirtilen port üzerinde başlatır ve bir mesaj gösterir
});

