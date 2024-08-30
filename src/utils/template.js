const TemplateRegister = (name, otp) => `
  <table width="100%" bgcolor="#ffffff" cellpadding="0" cellspacing="0" border="0" align="center">
      <tbody>
        <!-- Header Row -->
        <tr>
          <td>
            <table width="600" cellpadding="0" cellspacing="0" border="0" align="center">
              <tbody>
                <tr>
                  <td style="text-align: center; padding: 20px;">
                    <img src="https://ci3.googleusercontent.com/meips/ADKq_NaueDmHN6gM6qsAbaKhuecE054ldVeFhxLOHJOA2eo25SeosakamlWikcxJNc-bfgbXHcyEhYH2rqgRtAvwERwjwMwuJlFyTwDuvajLgbjB-eh3nSnObb5I-gqRmiqYAmtbCg2_tEuf2qDjxWQxbre62R3HHYKf9cJb=s0-d-e1-ft#https://res.cloudinary.com/dxrkwmirs/image/upload/v1725009771/logo_light-removebg-preview_cbwkxm.png" width="140" height="auto" style="width:12%; height:auto;">
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
    
        <!-- Body Row -->
        <tr>
          <td>
            <table width="600" cellpadding="0" cellspacing="0" border="0" align="center">
              <tbody>
                <tr>
                  <td style="font-family:Helvetica, Arial, sans-serif; font-size:13px; color:#000000; text-align:center; line-height:18px; padding: 20px;">
                    Xin chào {{name}},
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Helvetica, Arial, sans-serif; font-size:13px; color:#000000; text-align:center; line-height:18px; padding: 10px;">
                    Mã xác minh tài khoản ShopeDev của bạn là:
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Helvetica, Arial, sans-serif; font-size:40px; color:#ee4d2d; text-align:center; line-height:100px; letter-spacing:18px; padding: 10px;">
                    <b>{{otp}}</b>
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Helvetica, Arial, sans-serif; font-size:13px; color:#000000; text-align:center; line-height:18px; padding: 10px;">
                    Có hiệu lực trong 5 phút. KHÔNG chia sẻ mã này với người khác, kể cả nhân viên ShopeDev.
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
    
        <!-- Footer Row -->
        <tr>
          <td>
            <table width="600" cellpadding="0" cellspacing="0" border="0" align="center">
              <tbody>
                <tr>
                  <td style="padding: 20px; text-align: center;">
                    <a href="https://play.google.com/store/apps/details?id=com.shopee.vn" target="_blank">
                      <img src="https://ci3.googleusercontent.com/meips/ADKq_NY00t7Vhs04cCBjdRIbVAqOW04dpq9co0yFi4rY3f9eDTNFxmD9Lwsa_-nAWyYF8GRv19AOi79hBUH-y4AGJj5xM6PGl2kslZj_LwWrs7Ce=s0-d-e1-ft#https://cf.shopee.sg/file/cacc3e27277d02501b0989fdcbaf18e9" width="130" style="width:130px;">
                    </a>
                    <a href="https://apps.apple.com/vn/app/id959841449" target="_blank">
                      <img src="https://ci3.googleusercontent.com/meips/ADKq_Nartbu3UbvL6zWABXPy50HGKDGYN3v39CXyZu_ko05txGYpnAwpZKexFdFlRC0lFu0GPxyB6l7wldAgorXHm1mqdxzZOvHcgaQw-_oiLX7c=s0-d-e1-ft#https://cf.shopee.sg/file/5b4dcec6c9c60950954b465bafee9cff" width="130" style="width:130px;">
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Helvetica, Arial, sans-serif; font-size:13px; color:#747474; text-align:center; line-height:18px; padding: 10px;">
                    Hãy mua sắm cùng ShopeDev
                  </td>
                </tr>
                <tr>
                  <td style="width:100%; height:5px; border-top:1px solid #e0e0e0; padding: 5px 0;">
                  </td>
                </tr>
                <tr>
                  <td style="font-family:Helvetica, Arial, sans-serif; font-size:11px; color:#747474; text-align:center; line-height:16px; padding: 20px;">
                    © 2024 ShopeDev. Tất cả các quyền được bảo lưu.<br>
                    <a href="mailto:support@shope.dev" target="_blank" style="color:#747474;">Hỗ trợ</a> |
                    <a href="https://www.shopeedv.com/privacy-policy" target="_blank" style="color:#747474;">Chính sách bảo mật</a> |
                    <a href="https://www.shopeedv.com/terms-of-service" target="_blank" style="color:#747474;">Điều khoản dịch vụ</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
`;
