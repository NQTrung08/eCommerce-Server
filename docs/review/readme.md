# Ecommerce

## User là Shop nhé ( ban đầu người tạo nhầm)

## Bài 1: create folder

1. controller: chỉ nhận và phản hồi các yêu cầu HTTP.
   1. Nhận các yêu cầu từ client.
   2. Xác thực dữ liệu đầu vào.
   3. Gọi các phương thức trong `service` để thực hiện các thao tác nghiệp vụ.
   4. Xử lý và định dạng dữ liệu phản hồi từ service.
   5. Trả lại phản hồi cho client.
2. Service chỉ xử lý các logic nghiệp vụ và thao tác với dữ liệu. ( tức là bên trong thằng controller có thể dùng nhiều service)
   1. Xử lý logic nghiệp vụ và quy trình ứng dụng.
   2. Tương tác với cơ sở dữ liệu để thực hiện các thao tác CRUD.
   3. Gọi các API của bên thứ ba nếu cần.
   4. Thực hiện các phép toán, tính toán, hoặc xử lý dữ liệu.

## Bài 2 - Using middleware trong dự án

1. helmet là để bảo vệ những thông tin riêng tư
2. morgan để log các request
3. compression để nén các tập tin giúp giảm băng thông, dung lượng trên server

## Bài 3 - Connect Database using Mongoose

1. Nhược điểm của cách Connect cũ ( V )
   1. chỉ là nhược điểm với java hoặc python,... do luôn tạo ra kết nối mới mỗi khi connect db

2. Cách Connect `mới`, khuyên dùng ( V )
   1. singleton giúp tạo ra 1 instance duy nhất

3. Kiểm tra hệ thống có bao nhiêu Connect ( V )
4. Thông báo khi server quá tải Connect ( V )
   1. Sử dụng os và process

5. có nên disConnect() liên tục hay không
   1. trong mongoose ta không cần phải đóng connect tại vì trong mongoose nó `tự động duy trì kết nối tới MongoDB và quản lý pool kết nối, giúp tối ưu hiệu suất và tài nguyên`. Khác với java hay python nó luôn cố gắng tạo 1 connect mới tới db.
   2. Nếu muốn `đóng connect` thì làm sao? Nếu muốn đóng thì sử dụng process.on() để đóng hết tất cả các kết nối tới mongodb tránh việc mất dữ liệu.

6. PoolSize là gì? Vì sao lại quan trọng
   1. Connection Pool Size: đề cập đến `số lượng kết nối tối đa`mà một `connection pool` có thể `duy trì sẵn` để phục vụ các yêu cầu từ ứng dụng đến cơ sở dữ liệu.
   2. ví dụ trong ứng dụng của bạn yêu cầu kết nối với cơ sở dữ liệu thì mongoose sẽ kiểm tra `nhóm kết nối` xem đã có kết nối đó `trong nhóm` chưa. Nếu chưa nó sẽ tạo ra kết nối mới và thêm vào nhóm

7. Nếu vượt quá kết nối PoolSize?
   1. Nếu có vượt quá poolsize thì kết nối vượt quá đó sẽ queue ( xếp hàng chờ đợi) khi có connect được giải phóng thì nó sẽ nhảy vào.
   2. có nghĩa là `bất kỳ yêu cầu nào vượt quá giới hạn` này `sẽ bị trì hoãn` cho đến khi `một trong các kết nối` hiện có `được trả lại về pool`.

### Chú ý

1. do là nodejs nên mỗi khi các module như mongoose được require và nó sẽ catch lại và không gọi lại các connect database mới nhuư Java hay Python.
2. trong mongoose ta không cần phải đóng connect tại vì trong mongoose nó `tự động duy trì kết nối tới MongoDB và quản lý pool kết nối, giúp tối ưu hiệu suất và tài nguyên`. Khác với java hay python nó luôn cố gắng tạo 1 connect mới tới db.
3. Nếu muốn `đóng connect` thì làm sao? Nếu muốn đóng thì sử dụng process.on() để đóng hết tất cả các kết nối tới mongodb tránh việc mất dữ liệu.

- `useNewUrlParser`: true: Tùy chọn này sử dụng bộ phân tích cú pháp chuỗi kết nối MongoDB mới.
useUnifiedTopology: true: Tùy chọn này sử dụng lớp topology hợp nhất mới.
- `useFindAndModify`: false: Vô hiệu hóa việc sử dụng hàm findAndModify(), thay vào đó sử dụng hàm findOneAndUpdate() gốc.
- `autoIndex`: false: Vô hiệu hóa tự động lập chỉ mục cho các bảng, điều này có thể cải thiện hiệu suất trong các môi trường sản xuất.
- `poolSize`: 10: Thiết lập kích thước của bể kết nối (connection pool) thành 10, tức là có thể có tối đa 10 kết nối đồng thời.
- `connectTimeoutMS`: 10000: Thiết lập thời gian chờ kết nối (tính bằng mili giây) thành 10 giây.
- `socketTimeoutMS`: 45000: Thiết lập thời gian chờ cho socket (tính bằng mili giây) thành 45 giây.
- `family`: 4: Sử dụng IPv4, bỏ qua việc thử kết nối IPv6.

## Bài 4: Sự khác biệt giữa ENV và Config

1. So sánh tổng quan:
   1. `Lưu trữ thông tin nhạy cảm`: `ENV` được `ưu tiên` hơn `Config` để lưu trữ thông tin nhạy cảm do dễ bảo mật và quản lý hơn.
   2. `Thay đổi cấu hình`: `ENV linh hoạt hơn` vì có thể thay đổi mà không cần chỉnh sửa mã nguồn, trong khi Config yêu cầu thay đổi tệp cấu hình.
   3. `Cấu trúc`: `Config` thường có `cấu trúc phức tạp` và `rõ ràng hơn`, phù hợp với các `cấu hình hệ thống` hoặc `ứng dụng chi tiết`.
   4. `Phân chia môi trường`: `ENV` `dễ quản lý` cho các môi trường khác nhau như phát triển, kiểm thử và sản xuất.
2. Sử dụng package `dotenv` để `tải biến môi trường` từ `file .env` không thì phải thiết lập bằng terminal
3. Nếu ta dùng `lệnh NODE_ENV=pro trên terminal`( trong lúc đó `ta cũng khai báo` biến môi trường `trong file .env` `NODE_ENV=test`) => `thì` nó sẽ ưu tiên `lấy thằng ở terminal` => `NODE_ENV=pro`

## Bài 5: Routes ( các Router) - API

### Routes

1. là các quy tắc định nghĩa cách ứng dụng phản hồi các yêu cầu từ client đến các endpoints khác nhau. Mỗi route liên kết 1 URL cụ thể với 1 hàm xử lý, và có thế có các method HTTP.

### Tại sao cần dùng Routes

1. Quản lý logic: chia ứng dụng thành các phần nhỏ, mỗi routes quản lý 1 phần cụ thể
2. Dễ bảo trì và mở rộng: với routes có thể thêm sửa xóa các chức năng mà không ảnh hướng đến toàn bộ hệ thống
3. Tổ chức rõ ràng: dễ  hiểu và dễ đọc
4. Xử lý các loại yêu cầu khác nhau

### Cách hoạt động của Routes

1. định nghĩa các `route` trong `Express` để `xử lý` các yêu cầu đến các URL cụ thể. `Mỗi route` bao `gồm` `một URL` và `một hoặc nhiều` `hàm xử lý`.
2. sử dụng các phương thức HTTP để xử lý các loại yêu cầu
3. `URL của route` có thể  bao gồm các `tham số động`, có thể truy cập thông qua `req.params`.

### Cách dùng Router()

- Sử dụng `express.Router()` giúp tổ chức mã nguồn một cách có `cấu trúc` và `dễ quản lý` hơn, đặc biệt khi bạn có nhiều tuyến đường và muốn tách chúng thành các mô-đun riêng biệt.
- `express.Router` tạo `một instance` của `một router` để xử lý các tuyến đường (routes) liên quan đến một phần cụ thể của ứng dụng

1. `Bước 1: Tạo một file routes riêng biệt`
2. `Sử dụng router trong ứng dụng chính`

#### chú ý:

1. Express `sẽ kiểm tra` các `tuyến đường` **theo thứ tự** chúng được khai báo
2. `Thứ tự khai báo` các `tuyến đường` trong Express rất `quan trọng`. Để tránh `nhầm lẫn` và `xử lý` `sai tuyến đường`, hãy `luôn khai báo` các `tuyến đường tĩnh` **trước** các `tuyến đường động`. Điều này đảm bảo rằng các yêu cầu đến các URL cụ thể sẽ được xử lý đúng cách.
3. 200 (ok), 201(create), 202(update), 203(delete)
4. trong folder access: signup, login, refesh token

### Sử  dụng JWT để AUTHENTICATION

1. dùng module Crypto với method `generateKeyPairSync` để tạo cặp khóa publickey và privateKey RSA
   1. `privateKey`: Dùng để ký JWT. Chỉ có server biết và bảo mật tuyệt đối.
   2. `Public Key`: Dùng để xác minh JWT. Có thể được chia sẻ công khai và không cần bảo mật.
   3. Như vậy, `khóa công khai` **chỉ** `xác nhận` `tính toàn vẹn` và `xác thực` của JWT, đảm bảo rằng token đó `do chủ sở hữu` của `khóa bí mật` **ký** và không bị thay đổi kể từ khi được ký.
   4. `pkcs1`: tiêu chuẩn mật mã được thiết kế để sử dụng RSA (Rivest-Shamir-Adleman) cho việc ký kết và mã hóa
   5. `pem`: một định dạng để lưu trữ và truyền tải các dữ liệu mật mã như khóa, chứng chỉ và yêu cầu ký chứng chỉ như SSL,..

2. jwt: chỉ lưu thông tin cần thiết, không nhạy cảm
   1. refresh token: thường không nên chứa thông tin nhạy cảm mà chỉ dùng để xác thực và tạo lại access token.
   2. Nếu cần lưu trữ thông tin nhạy cảm, hãy sử dụng mã hóa và lưu trữ an toàn trên server.

   ```js
     const publicKeyString = await keyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey: publicKey,
        })

        if (!publicKeyString) {
          return {
            code: 'xxx',
            message: 'Failed to generate public key',
          }
        }

        console.log("Public Key String::", publicKeyString)

        const publicKeyObject = crypto.createPublicKey(publicKeyString)
        console.log("Public Key Object::", publicKeyObject)

        // create token pair
        const tokens = await createTokenPair(
          { userId: newShop._id,
            email
          },
          publicKeyObject, (**)
          privateKey
        )

      (**) giải thích
      - với đoạn này tác giả đang hiểủ nhầm 1 chút về jwtwebtoken
      - tác giả nghĩ rằng phải truyền vào 1 `publicKey` dạng `Object` => (publicKeyObject chuyển từ puclicKeyString) thì mới có thể verify() nhưng jwtwebtoken nhận cả vào 1 kiểu `pem` nên nếu ta truyền vào là `publicKeyString` thay `publicKeyObject` cũng oke
   ```

3. Sử dụng library `lodash` với các tiện ích để làm việc với mảng, object, chuỗi,...

## Bài 6: Custom Dynamic Middleware for APIKEY và Permissions

## APIKEY là gì?

1. là một đoạn mã duy nhất được cấp phát cho người dùng hoặc ứng dụng để nhận diện và xác thực khi truy cập vào các dịch vụ API.
   1. `Xác thực`: `Xác định` và `xác thực` người dùng hoặc ứng dụng `đang gọi API`.
   2. `Kiểm soát truy cập`: `Hạn chế quyền` truy cập vào các API cụ thể dựa trên API Key.
   3. Theo dõi sử dụng: Theo dõi và giám sát việc sử dụng API bởi từng người dùng hoặc ứng dụng.
   4. Giới hạn tốc độ: Áp dụng giới hạn tốc độ và hạn mức sử dụng API cho từng API Key để tránh lạm dụng.

## KHi nào nên dùng async/ await

1. thường được sử dụng để xử lý các thao tác bất đồng bộ:
   1. `gọi API`
   2. `truy vấn cơ sở dữ liệu`
   3. đọc/ghi tệp`

## Bài 7: xử lý errorhandler

- middleware có 3 tham số
- cơ chế xử lý lỗi thì có 4 tham số ( error, req, res, next)
- `throw` là 1 cách để tạo 1 lỗi và chuyển quyền điều khiển đến cơ chế xử lý lỗi hiện tại

### Bắt đầu với việc:

1. tạo 1 cơ chế xử lý lỗi (tại file app.js)
2. tạo các class Lỗi (BadRequest, Conflict, ...) kế thừa từ class Error.
3. sử dụng `throw` cùng các `class Lỗi` để chuyển tới cơ chế xử lý lỗi
   => Đây mới chỉ là xử lý lỗi với tầng `service`
4. ta cần xử lý lỗi với tầng `controller`
   1. viết 1 middleware: `handle Error` để xử lý phần `router`

## Bài 8: Make Your API Response use class