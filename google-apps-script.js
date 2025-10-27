// Google Apps Script 後端程式碼 - 支援查詢功能
// 請複製此檔案內容到 Google Apps Script 編輯器中

// ===== 設定區域 =====
const SHEET_ID = 'YOUR_SHEET_ID_HERE'; // 替換為您的 Google Sheet ID
const DRIVE_FOLDER_ID = 'YOUR_FOLDER_ID_HERE'; // 替換為您的 Google Drive 資料夾 ID
const ADMIN_PASSWORD = 'admin123'; // 請修改為您的管理者密碼

// ===== 主要處理函數 =====
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'query') {
      // 客戶查詢自己的資料
      const email = e.parameter.email;
      return handleQuery(email);
    } else if (action === 'admin') {
      // 管理者查看所有資料
      return handleAdminQuery();
    } else {
      return ContentService
        .createTextOutput('API 正常運作中')
        .setMimeType(ContentService.MimeType.TEXT);
    }
  } catch (error) {
    console.log('GET 錯誤: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    // 診斷資訊
    console.log('doPost 被呼叫');
    console.log('e 的類型:', typeof e);
    console.log('e 的值:', JSON.stringify(e));
    
    if (!e) {
      throw new Error('e 參數是 undefined');
    }
    
    if (!e.parameter) {
      console.log('e.parameter 不存在');
      console.log('e 的所有屬性:', Object.keys(e));
      throw new Error('e.parameter 是 undefined');
    }
    
    console.log('e.parameter 存在');
    const params = e.parameter;
    console.log('params 數量:', Object.keys(params).length);
    
    if (!e.parameters) {
      console.log('警告: e.parameters 不存在');
    } else {
      console.log('e.parameters 存在');
    }
    
    const files = extractFiles(e);
    console.log('提取的檔案數量:', Object.keys(files).length);
    
    const sheet = getOrCreateSheet();
    
    // 先創建主資料夾
    const mainFolder = createMainFolder(params);
    console.log('主資料夾創建成功');
    
    // 處理商品圖片
    const productImageData = processImages(files, params, mainFolder);
    console.log('商品圖片處理完成');
    
    // 處理環境圖和價目表
    const envAndPriceData = processEnvAndPriceImages(files, params, mainFolder);
    console.log('環境圖和價目表處理完成');
    
    const rowData = prepareRowData(params, productImageData, envAndPriceData);
    console.log('資料準備完成');
    
    sheet.appendRow(rowData);
    console.log('資料寫入 Sheet 成功');
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: '資料已成功儲存' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('POST 錯誤: ' + error.toString());
    console.error('錯誤堆疊: ' + error.stack);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== 查詢功能 =====
function handleQuery(email) {
  try {
    if (!email) {
      throw new Error('請提供Email');
    }
    
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('商家資料');
    if (!sheet) {
      throw new Error('找不到資料表');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailIndex = headers.indexOf('聯絡人Email');
    
    if (emailIndex === -1) {
      throw new Error('找不到Email欄位');
    }
    
    // 篩選符合Email的記錄
    const records = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[emailIndex].toLowerCase() === email.toLowerCase()) {
        records.push(parseRowToObject(headers, row));
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        data: records 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.log('查詢錯誤: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== 管理者查詢 =====
function handleAdminQuery() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('商家資料');
    if (!sheet) {
      throw new Error('找不到資料表');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    // 取得所有記錄
    const records = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[0]) { // 確保不是空行
        records.push(parseRowToObject(headers, row));
      }
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        data: records 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.log('管理者查詢錯誤: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ===== 解析行資料為物件 =====
function parseRowToObject(headers, row) {
  const obj = {
    submitTime: row[0] || '',
    storeType: row[1] || '',
    storeName: row[2] || '',
    branchName: row[3] || '',
    contactPerson: row[4] || '',
    contactEmail: row[5] || '',
    contactPhone: row[6] || '',
    storeAddress: row[7] || '',
    addressSupplement: row[8] || '',
    selectedCategory: row[9] || '',
    selectedSubcategories: row[10] || '',
    minPrice: row[11] || '',
    maxPrice: row[12] || '',
    businessDays: row[13] || '',
    businessHours: row[14] || '',
    businessHoursSupplement: row[15] || '',
    closedDays: row[16] || '',
    closedDaysSupplement: row[17] || '',
    websiteUrl: row[18] || '',
    facebookUrl: row[19] || '',
    lineUrl: row[20] || '',
    instagramUrl: row[21] || '',
    googleBusinessUrl: row[22] || '',
    linkNotes: row[23] || '',
    storeIntroduction: row[24] || '',
    envImageLinks: row[25] || '',
    priceListLinks: row[26] || '',
    products: []
  };
  
  // 解析商品資料
  const productData = row[27] || '';
  const imageLinks = row[28] || '';
  
  if (productData) {
    obj.products = parseProducts(productData, imageLinks);
  }
  
  return obj;
}

// ===== 解析商品資料 =====
function parseProducts(productDataStr, imageLinksStr) {
  const products = [];
  
  try {
    const productBlocks = productDataStr.split('\n\n');
    const imageBlocks = imageLinksStr ? imageLinksStr.split('\n\n') : [];
    
    productBlocks.forEach((block, index) => {
      const lines = block.split('\n');
      const product = {
        name: '',
        price: '',
        description: '',
        images: []
      };
      
      lines.forEach(line => {
        if (line.includes('名稱:')) {
          product.name = line.split('名稱:')[1].trim();
        } else if (line.includes('價格:')) {
          product.price = line.split('價格:')[1].trim();
        } else if (line.includes('描述:')) {
          product.description = line.split('描述:')[1].trim();
        }
      });
      
      // 解析圖片連結
      if (imageBlocks[index]) {
        const imageLines = imageBlocks[index].split('\n');
        imageLines.forEach(line => {
          if (line.startsWith('http')) {
            product.images.push(line.trim());
          }
        });
      }
      
      if (product.name) {
        products.push(product);
      }
    });
  } catch (error) {
    console.log('解析商品資料錯誤: ' + error.toString());
  }
  
  return products;
}

// ===== 取得或建立工作表 =====
function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('商家資料');
  
  if (!sheet) {
    sheet = ss.insertSheet('商家資料');
    
    const headers = [
      '提交時間',
      '店家類型',
      '店家名稱',
      '分店名稱',
      '聯絡人',
      '聯絡人Email',
      '聯絡人電話',
      '店家地址',
      '地址補充',
      '服務分類',
      '服務項目',
      '服務起跳金額',
      '最高消費金額',
      '營業星期',
      '營業時間',
      '營業時間補充',
      '公休時間',
      '公休時間補充',
      '官網連結',
      'FB連結',
      'LINE連結',
      'IG連結',
      'Google商家連結',
      '連結備註',
      '商家介紹',
      '環境圖連結',
      '價目表連結',
      '商品資料',
      '商品圖片連結'
    ];
    
    sheet.appendRow(headers);
    
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#667eea');
    headerRange.setFontColor('#ffffff');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
  }
  
  return sheet;
}

// ===== 創建商家主資料夾 =====
function createMainFolder(params) {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const storeName = (params.storeName || '未命名店家').replace(/[<>:"/\\|?*]/g, '_');
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyyMMdd_HHmmss');
  const mainFolderName = `${storeName}_${timestamp}`;
  return folder.createFolder(mainFolderName);
}

// ===== 提取上傳的檔案 =====
function extractFiles(e) {
  const files = {};
  
  try {
    if (e.parameters) {
      for (let key in e.parameters) {
        // 處理商品圖片
        if (key.startsWith('product_') && key.includes('_image_')) {
          const matches = key.match(/product_(\d+)_image_(\d+)/);
          if (matches) {
            const productId = matches[1];
            const imageIndex = matches[2];
            
            if (!files[productId]) {
              files[productId] = [];
            }
            
            const base64Data = e.parameters[key];
            if (base64Data && base64Data.length > 0) {
              files[productId].push({
                data: base64Data,
                index: imageIndex
              });
            }
          }
        }
        // 處理環境圖
        else if (key.startsWith('env_image_')) {
          if (!files['env_images']) {
            files['env_images'] = [];
          }
          
          const base64Data = e.parameters[key];
          if (base64Data && base64Data.length > 0) {
            files['env_images'].push({
              data: base64Data,
              index: key.replace('env_image_', '')
            });
          }
        }
        // 處理價目表
        else if (key.startsWith('pricelist_image_')) {
          if (!files['pricelist_images']) {
            files['pricelist_images'] = [];
          }
          
          const base64Data = e.parameters[key];
          if (base64Data && base64Data.length > 0) {
            files['pricelist_images'].push({
              data: base64Data,
              index: key.replace('pricelist_image_', '')
            });
          }
        }
      }
    }
  } catch (error) {
    console.log('提取檔案錯誤: ' + error.toString());
  }
  
  return files;
}

// ===== 處理圖片上傳 =====
function processImages(files, params, mainFolder) {
  const imageLinks = {};
  
  try {
    console.log('開始處理商品圖片，商品數量: ' + Object.keys(files).length);
    
    for (let productId in files) {
      console.log('處理商品ID: ' + productId);
      const productName = params[`productName_${productId}`] || `商品${productId}`;
      console.log('商品名稱: ' + productName);
      
      // 在主資料夾下建立商品資料夾
      const productFolderName = `商品_${productName}`;
      console.log('創建商品資料夾: ' + productFolderName);
      const productFolder = mainFolder.createFolder(productFolderName);
      console.log('商品資料夾創建成功');
      
      imageLinks[productId] = [];
      
      console.log('該商品的圖片數量: ' + files[productId].length);
      
      files[productId].forEach((fileData, index) => {
        try {
          console.log(`處理商品${productId}的第${index + 1}張圖片`);
          
          const base64String = fileData.data;
          console.log('Base64 字串長度: ' + base64String.length);
          
          let mimeType = 'image/jpeg';
          let base64Data = base64String;
          
          if (base64String.indexOf(',') > -1) {
            const parts = base64String.split(',');
            const mimeMatch = parts[0].match(/:(.*?);/);
            if (mimeMatch) {
              mimeType = mimeMatch[1];
            }
            base64Data = parts[1];
            console.log('提取 Base64 數據成功，類型: ' + mimeType);
          }
          
          console.log('開始解碼 Base64...');
          const decodedData = Utilities.base64Decode(base64Data);
          console.log('Base64 解碼成功，數據大小: ' + decodedData.length);
          
          const blob = Utilities.newBlob(decodedData, mimeType, `${productName}_圖片${index + 1}.jpg`);
          console.log('創建 Blob 成功');
          
          console.log('開始上傳檔案...');
          const file = productFolder.createFile(blob);
          console.log('檔案上傳成功');
          
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          console.log('設定分享權限成功');
          
          imageLinks[productId].push(file.getUrl());
          console.log('圖片連結: ' + file.getUrl());
        } catch (error) {
          console.log(`上傳圖片失敗 (商品${productId}, 圖片${index}): ${error.toString()}`);
          console.log('錯誤堆疊: ' + error.stack);
        }
      });
    }
    console.log('所有商品圖片處理完成');
  } catch (error) {
    console.log('處理圖片錯誤: ' + error.toString());
    console.log('錯誤堆疊: ' + error.stack);
  }
  
  return imageLinks;
}

// ===== 處理環境圖和價目表圖片 =====
function processEnvAndPriceImages(files, params, mainFolder) {
  const result = {
    envImageLinks: [],
    priceListLinks: []
  };
  
  try {
    console.log('開始處理環境圖和價目表');
    
    // 處理環境圖
    if (files['env_images'] && files['env_images'].length > 0) {
      console.log('找到環境圖，數量: ' + files['env_images'].length);
      
      console.log('創建環境圖資料夾...');
      const envFolder = mainFolder.createFolder('環境圖');
      console.log('環境圖資料夾創建成功');
      
      files['env_images'].forEach((fileData, index) => {
        try {
          console.log(`處理第${index + 1}張環境圖`);
          
          const base64String = fileData.data;
          console.log('Base64 字串長度: ' + base64String.length);
          
          let mimeType = 'image/jpeg';
          let base64Data = base64String;
          
          if (base64String.indexOf(',') > -1) {
            const parts = base64String.split(',');
            const mimeMatch = parts[0].match(/:(.*?);/);
            if (mimeMatch) {
              mimeType = mimeMatch[1];
            }
            base64Data = parts[1];
            console.log('提取 Base64 數據成功，類型: ' + mimeType);
          }
          
          console.log('開始解碼 Base64...');
          const decodedData = Utilities.base64Decode(base64Data);
          console.log('Base64 解碼成功，數據大小: ' + decodedData.length);
          
          const blob = Utilities.newBlob(decodedData, mimeType, `環境圖_${index + 1}.jpg`);
          console.log('創建 Blob 成功');
          
          console.log('開始上傳檔案...');
          const file = envFolder.createFile(blob);
          console.log('檔案上傳成功');
          
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          console.log('設定分享權限成功');
          
          result.envImageLinks.push(file.getUrl());
          console.log('環境圖連結: ' + file.getUrl());
        } catch (error) {
          console.log(`上傳環境圖失敗 (圖片${index}): ${error.toString()}`);
          console.log('錯誤堆疊: ' + error.stack);
        }
      });
      
      console.log('所有環境圖處理完成');
    } else {
      console.log('沒有找到環境圖');
    }
    
    // 處理價目表
    if (files['pricelist_images'] && files['pricelist_images'].length > 0) {
      console.log('找到價目表，數量: ' + files['pricelist_images'].length);
      
      console.log('創建價目表資料夾...');
      const pricelistFolder = mainFolder.createFolder('價目表');
      console.log('價目表資料夾創建成功');
      
      files['pricelist_images'].forEach((fileData, index) => {
        try {
          console.log(`處理第${index + 1}張價目表`);
          
          const base64String = fileData.data;
          console.log('Base64 字串長度: ' + base64String.length);
          
          let mimeType = 'image/jpeg';
          let base64Data = base64String;
          
          if (base64String.indexOf(',') > -1) {
            const parts = base64String.split(',');
            const mimeMatch = parts[0].match(/:(.*?);/);
            if (mimeMatch) {
              mimeType = mimeMatch[1];
            }
            base64Data = parts[1];
            console.log('提取 Base64 數據成功，類型: ' + mimeType);
          }
          
          console.log('開始解碼 Base64...');
          const decodedData = Utilities.base64Decode(base64Data);
          console.log('Base64 解碼成功，數據大小: ' + decodedData.length);
          
          const blob = Utilities.newBlob(decodedData, mimeType, `價目表_${index + 1}.jpg`);
          console.log('創建 Blob 成功');
          
          console.log('開始上傳檔案...');
          const file = pricelistFolder.createFile(blob);
          console.log('檔案上傳成功');
          
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          console.log('設定分享權限成功');
          
          result.priceListLinks.push(file.getUrl());
          console.log('價目表連結: ' + file.getUrl());
        } catch (error) {
          console.log(`上傳價目表失敗 (圖片${index}): ${error.toString()}`);
          console.log('錯誤堆疊: ' + error.stack);
        }
      });
      
      console.log('所有價目表處理完成');
    } else {
      console.log('沒有找到價目表');
    }
    
  } catch (error) {
    console.log('處理環境圖/價目表錯誤: ' + error.toString());
    console.log('錯誤堆疊: ' + error.stack);
  }
  
  return result;
}

// ===== 準備寫入的資料 =====
function prepareRowData(params, imageData, envAndPriceData) {
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd HH:mm:ss');
  
  const products = [];
  const productImageLinks = [];
  
  let productNum = 1;
  while (params[`productName_${productNum}`]) {
    const productInfo = {
      name: params[`productName_${productNum}`] || '',
      price: params[`productPrice_${productNum}`] || '',
      description: params[`productDesc_${productNum}`] || ''
    };
    
    products.push(
      `【商品${productNum}】\n` +
      `名稱: ${productInfo.name}\n` +
      `價格: ${productInfo.price}\n` +
      `描述: ${productInfo.description}`
    );
    
    if (imageData[productNum] && imageData[productNum].length > 0) {
      productImageLinks.push(
        `【商品${productNum} - ${productInfo.name}】\n` +
        imageData[productNum].join('\n')
      );
    }
    
    productNum++;
  }
  
  // 處理環境圖連結
  const envLinks = envAndPriceData && envAndPriceData.envImageLinks 
    ? envAndPriceData.envImageLinks.join('\n') 
    : '';
  
  // 處理價目表連結
  const priceLinks = envAndPriceData && envAndPriceData.priceListLinks 
    ? envAndPriceData.priceListLinks.join('\n') 
    : '';
  
  return [
    timestamp,
    params.storeTypes || params.storeType || '',
    params.storeName || '',
    params.branchName || '',
    params.contactPerson || '',
    params.contactEmail || '',
    params.contactPhone || '',
    params.storeAddress || '',
    params.addressSupplement || '',
    params.selectedCategory || '',
    params.selectedSubcategories || '',
    params.minPrice || '',
    params.maxPrice || '',
    params.businessDays || '',
    params.businessHours || '',
    params.businessHoursSupplement || '',
    params.closedDays || '',
    params.closedDaysSupplement || '',
    params.websiteUrl || '',
    params.facebookUrl || '',
    params.lineUrl || '',
    params.instagramUrl || '',
    params.googleBusinessUrl || '',
    params.linkNotes || '',
    params.storeIntroduction || '',
    envLinks,
    priceLinks,
    products.join('\n\n'),
    productImageLinks.join('\n\n')
  ];
}

// ===== 測試函數 =====
function testQuery() {
  const result = handleQuery('test@example.com');
  console.log(result.getContent());
}

function testAdminQuery() {
  const result = handleAdminQuery();
  console.log(result.getContent());
}
