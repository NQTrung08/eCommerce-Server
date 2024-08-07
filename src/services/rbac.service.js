const { Schema, model } = require('mongoose');
const roleModel = require('../models/role.model');
const resourceModel = require('../models/resource.model');
const { NotFoundError } = require('../core/error.response');

const getGrantList = async () => {
    try {
        const grantList = await roleModel.aggregate([
            { $unwind: '$rol_grants' },  // Giải nén mảng rol_grants
            {
                $lookup: {
                    from: 'Resources',  // Tên collection resources cần phải chính xác
                    localField: 'rol_grants.resource',
                    foreignField: '_id',
                    as: 'resourceDetails'
                }
            },
            { $unwind: '$resourceDetails'},  // Giải nén mảng resourceDetails, giữ dữ liệu nếu không có kết quả
            {
                $project: {
                    role: '$roleName',
                    resource: '$resourceDetails.resourceName',
                    action: '$rol_grants.actions',
                    attributes: '$rol_grants.attributes'
                }
            },
            { $unwind: '$action' },  // Giải nén mảng actions để có từng quyền hành động
            {
                $project: {
                    role: 1,
                    resource: 1,
                    action: 1,
                    attributes: 1
                }
            }
        ]);

        


        // console.log(grantList);

        return grantList;
    } catch (err) {
        console.error(err);
        throw err;  // Ném lỗi để xử lý bên ngoài
    }
}

const createRole = async (roleData) => {
    try {
      // Xác thực và chuẩn bị dữ liệu trước khi lưu
      const { roleName, roleSlug, roleStatus, roleDesc, rol_grants } = roleData;
  
      // Kiểm tra các quyền trong rol_grants để đảm bảo resource tồn tại
      for (const grant of rol_grants) {
        const resource = await resourceModel.findById(grant.resource);
        if (!resource) {
          throw new Error(`Resource with ID ${grant.resource} does not exist.`);
        }
      }
  
      // Tạo một vai trò mới
      const newRole = new roleModel({
        roleName,
        roleSlug,
        roleStatus,
        roleDesc,
        rol_grants
      });
  
      // Lưu vai trò mới vào cơ sở dữ liệu
      const savedRole = await newRole.save();
  
      return savedRole;
    } catch (err) {
      console.error('Error creating role:', err);
      throw err;
    }
};

const updateRole = async (id, updatedData) => {
  try {

    console.log(id)
    // Xác thực và chuẩn bị dữ liệu trước khi lưu
    const { roleName, roleSlug, roleStatus, roleDesc, rol_grants } = updatedData;

    // Kiểm tra các quyền trong rol_grants để đảm bảo resource tồn tại
    for (const grant of rol_grants) {
      const resource = await resourceModel.findById(grant.resource);
      if (!resource) {
        throw new Error(`Resource with ID ${grant.resource} does not exist.`);
      }
    }

    // Tìm vai trò theo ID và cập nhật dữ liệu
    const role = await roleModel.findById(id);
    if (!role) {
      throw new NotFoundError('Role not found.');
    }

    // Cập nhật vai trò với ID
    const updatedRole = await roleModel.findByIdAndUpdate(id, {
      roleName,
      roleSlug,
      roleStatus,
      roleDesc,
      rol_grants
    }, { new: true });

    return updatedRole;
  } catch (error) {
    console.error('Error updating role:', error);
  }
}

module.exports = {
    getGrantList,
    createRole,
    updateRole
};
