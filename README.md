# Webrtc 视屏通话

## 对于使用webrtc进行视屏通话，主要解决的问题存在一下几个方面
1. 视频通话需要视频流推送，所以需要有一个socket服务器 可以使用socket.io
2. webrtc的通信需要https，所以需要搭建一个https环境，对于服务器端可以使用nginx代理。在代理的过程中需要生成证书
3. 客户端https，可以使用webpack-dev-server的https将证书的签名文件放入就好了
4. 视频保存 需要用到 MediaRecorder来一段一段的传输视屏流，服务器将视频流写入文件就好
5. 截图保存图像，可以使用canvas来截取图片
6. https网址不允许发送http请求，所以内容所有的http请求都要设置代理


### 生成证书
OPENSSL生成SSL自签证书
OPENSSL生成SSL自签证书
目前，有许多重要的公网可以访问的网站系统(如网银系统)都在使用自签SSL证书，即自建PKI系统颁发的SSL证书，而不是部署支持浏览器的SSL证书。

支持浏览器的SSL证书无疑安全性是好的，但要收费（而且是按年收）。

自签SSL证书当然是免费的，但安全性就差了。

数字证书（Certificate）
在HTTPS的传输过程中，有一个非常关键的角色——数字证书，那什么是数字证书？又有什么作用呢？

所谓数字证书，是一种用于电脑的身份识别机制。由数字证书颁发机构（CA）对使用私钥创建的签名请求文件做的签名（盖章），表示CA结构对证书持有者的认可。数字证书拥有以下几个优点：

使用数字证书能够提高用户的可信度
数字证书中的公钥，能够与服务端的私钥配对使用，实现数据传输过程中的加密和解密
在证认使用者身份期间，使用者的敏感个人数据并不会被传输至证书持有者的网络系统上
X.509证书包含三个文件：key，csr，crt。

key是服务器上的私钥文件，用于对发送给客户端数据的加密，以及对从客户端接收到数据的解密
csr是证书签名请求文件，用于提交给证书颁发机构（CA）对证书签名
crt是由证书颁发机构（CA）签名后的证书，或者是开发者自签名的证书，包含证书持有人的信息，持有人的公钥，以及签署者的签名等信息
备注：在密码学中，X.509是一个标准，规范了公开秘钥认证、证书吊销列表、授权凭证、凭证路径验证算法等。

 

创建自签名证书的步骤
注意：以下步骤仅用于配置内部使用或测试需要的SSL证书。

第1步：生成私钥
使用openssl工具生成一个RSA私钥

 openssl genrsa -des3 -out server.key 1024
说明：生成rsa私钥，des3算法，2048位强度，server.key是秘钥文件名。

注意：生成私钥，需要提供一个至少4位的密码。

1024位RSA非对称密钥对已经变得不安全了，所以，美国国家标准技术研究院( NIST )要求停止使用不安全的1024位非对称加密算法。微软已经要求所有受信任的根证书颁发机构必须于2010年12月31日之前升级其不安全的1024位根证书到2048位和停止颁发不安全的1024位用户证书，12 月 31 日之后会把不安全都所有 1024 位根证书从 Windows 受信任的根证书颁发机构列表中删除！

而目前几乎所有自签证书都是1024位，自签根证书也都是1024位，当然都是不安全的。还是那句话：由于部署自签SSL证书而无法获得专业SSL证书提供商的专业指导，根本就不知道1024位已经不安全了。

第2步：生成CSR（证书签名请求）
生成私钥之后，便可以创建csr文件了。

此时可以有两种选择。理想情况下，可以将证书发送给证书颁发机构（CA），CA验证过请求者的身份之后，会出具签名证书（很贵）。

另外，如果只是内部或者测试需求，也可以使用OpenSSL实现自签名，具体操作如下：

 openssl req -new -key server.key -out server.csr -config openssl.cfg
说明：需要依次输入国家，地区，城市，组织，组织单位，Common Name和Email。其中Common Name，可以写自己的名字或者域名，

如果要支持https，Common Name应该与域名保持一致，否则会引起浏览器警告。

 
Country Name (2 letter code) [AU]:CN
State or Province Name (full name) [Some-State]:Beijing
Locality Name (eg, city) []:Beijing
Organization Name (eg, company) [Internet Widgits Pty Ltd]:joyios
Organizational Unit Name (eg, section) []:info technology
Common Name (e.g. server FQDN or YOUR name) []:demo.joyios.com   这一项必须和你的域名一致
Email Address []:liufan@joyios.com
第3步：删除私钥中的密码
在第1步创建私钥的过程中，由于必须要指定一个密码。而这个密码会带来一个副作用，那就是在每次Apache启动Web服务器时，都会要求输入密码，

这显然非常不方便。要删除私钥中的密码，操作如下：

openssl rsa -in server.key -out server.key
第4步：生成自签名证书
如果你不想花钱让CA签名，或者只是测试SSL的具体实现。那么，现在便可以着手生成一个自签名的证书了。

需要注意的是，在使用自签名的临时证书时，浏览器会提示证书的颁发机构是未知的。

 openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt
 
说明：crt上有证书持有人的信息，持有人的公钥，以及签署者的签名等信息。当用户安装了证书之后，便意味着信任了这份证书，同时拥有了其中的公钥。证书上会说明用途，例如服务器认证，客户端认证，或者签署其他证书。当系统收到一份新的证书的时候，证书会说明，是由谁签署的。如果这个签署者确实可以签署其他证书，并且收到证书上的签名和签署者的公钥可以对上的时候，系统就自动信任新的证书。

第5步：安装私钥和证书
将私钥和证书文件复制到Apache的配置目录下即可，在Mac 10.10系统中，复制到/etc/apache2/目录中即可。