const TemplateRegister = (name, otp) => `
  <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; text-align: center;">
  <div style="background-color: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 400px; width: 100%; margin: auto;">
    <img src="" alt="Shop Dev Logo" style="display: block; margin: 0 auto 1rem; height: 64px;" />
    <h2 style="font-size: 1.25rem; color: #2d3748; margin-bottom: 0.5rem;">Xin chào {{name}},</h2>
    <p style="font-size: 0.875rem; color: #4a5568; margin-bottom: 1.5rem;">Mã xác minh tài khoản Shop Dev của bạn là:</p>
    <div style="font-size: 3rem; color: #e53e3e; font-weight: bold; letter-spacing: 0.1rem; margin-bottom: 1.5rem;">{{otp}}</div>
    <p style="font-size: 0.875rem; color: #4a5568; margin-bottom: 1.5rem;">
      Có hiệu lực trong 15 phút. KHÔNG chia sẻ mã này với người khác, kể cả nhân viên Shop Dev.
    </p>
    <p style="font-size: 0.75rem; color: #718096;">
      Đây là email tự động. Vui lòng không trả lời email này. Thêm
      <a href="mailto:info@mail.shopdev.vn" style="color: #e53e3e; text-decoration: none;">info@mail.shopdev.vn</a> vào danh bạ email của bạn để đảm bảo bạn luôn nhận được email từ chúng tôi.
    </p>
    <p style="font-size: 0.75rem; color: #718096; margin-top: 1rem;">Địa chỉ: TLU University</p>
  </div>
</div>

`;
