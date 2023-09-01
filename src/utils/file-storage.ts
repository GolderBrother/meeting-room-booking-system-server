import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';

// 定义磁盘存储引擎
const storage = multer.diskStorage({
  // 通过 destination、filename 的参数分别指定保存的目录和文件名
  destination: function (req, file, cb) {
    try {
      fs.mkdirSync('uploads');
    } catch (e) {}

    // 指定文件存储目录
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    // 生成文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  },
});
// 创建 Multer 实例
// const upload = multer({ storage });
export { storage };
