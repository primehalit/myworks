Bu web için gereken postgresql komutları
 postgressql bağlanıın

CREATE DATABASE myproje;  // myproje adında dosya olusturnuz yada sıze baglı değiştirirsenız koddakı yerlerıde değiştirin
\c myproje;     // databaseın ıcıne gırıyoz

CREATE TABLE user_details (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  birthdate VARCHAR(255)
);

boyle bır user_ details adında tablo ve ıcındekılerı olusturuyoruz.

** BURASı KALDıRıLDı *
sohbet bolumu için veritabanı myprojeye bağlanıyoz databasıne yanı 

ALTER TABLE user_details
ADD CONSTRAINT unique_user_id UNIQUE (user_id); 

  //Bu sorgu, user_details tablosundaki user_id sütununa bir unique constraint ekler. Daha sonra messages tablosunu oluşturduğunuzda bu hatayı almamalısınız.


CREATE TABLE messages (
   id SERIAL PRIMARY KEY,
   sender_id VARCHAR(50) NOT NULL,
   content TEXT NOT NULL,
   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (sender_id) REFERENCES user_details (user_id)
);
