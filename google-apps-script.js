// ===== 設定區域 =====
const SHEET_ID = '1o0yfBUTf7URv4qGXJ58ANbihHxSM4PzX9p4L8dDixZA'; // 替換為您的 Google Sheet ID
const DRIVE_FOLDER_ID = '1dqtIfNCybJ_g5qpSINCBunJKn95wUpiV'; // 替換為您的 Google Drive 資料夾 ID
const ADMIN_PASSWORD = 'cc51845184'; // 請修改為您的管理者密碼

// ===== 主要處理函數 =====
function doGet(e) {
  try {
    const action = e.parameter.action;
    
    if (action === 'query') {
      const email = e.parameter.email;
      return handleQuery(email);
    } else if (action === 'admin') {
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
    console.log('doPost 被呼叫');
    
    //看接收到什麼
    let params;
    let postData;
    
    // 嘗試解析 JSON
    try {
      if (e.postData && e.postData.contents) {
        console.log('收到 POST data');
        postData = JSON.parse(e.postData.contents);
        params = postData;
        console.log('JSON 解析成功');
      } else if (e.parameter) {
        console.log('使用 e.parameter');
        params = e.parameter;
      } else {
        throw new Error('無法取得 POST 資料');
      }
    } catch (jsonError) {
      console.log('JSON 解析失敗，嘗試使用 parameter');
      params = e.parameter || {};
    }
    
    console.log('params 數量:', Object.keys(params).length);
    
    // 提取檔案
    const files = extractFilesFromParams(params);
    console.log('提取的檔案:', JSON.stringify(Object.keys(files)));
    
    const sheet = getOrCreateSheet();
    
    // 創建主資料夾
    const mainFolder = createMainFolder(params);
    console.log('主資料夾創建成功: ' + mainFolder.getName());
    
    // 處理環境圖和價目表
    const envAndPriceData = processEnvAndPriceImages(files, params, mainFolder);
    console.log('環境圖處理完成');
    
    // 處理商品圖片
    const productImageData = processImages(files, params, mainFolder);
    console.log('商品圖片處理完成');
    
    const rowData = prepareRowData(params, productImageData, envAndPriceData);
    console.log('資料準備完成');
    
    sheet.appendRow(rowData);
    console.log('資料寫入 Sheet 成功');
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: '資料已成功儲存',
        folderName: mainFolder.getName()
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

// ===== 從 params 提取檔案 =====
function extractFilesFromParams(params) {
  const files = {};
  
  try {
    console.log('開始提取檔案');
    
    for (let key in params) {
      // 處理環境圖
      if (key.startsWith('env_image_')) {
        if (!files['env_images']) {
          files['env_images'] = [];
        }
        
        const base64Data = params[key];
        if (base64Data && base64Data.length > 100) {  // 確保不是空字串
          files['env_images'].push({
            data: base64Data[0] || base64Data,  // 處理陣列或字串
            index: key.replace('env_image_', '')
          });
          console.log(`環境圖 ${key} 已提取，長度: ${base64Data.length || base64Data[0].length}`);
        }
      }
      // 處理價目表
      else if (key.startsWith('pricelist_image_')) {
        if (!files['pricelist_images']) {
          files['pricelist_images'] = [];
        }
        
        const base64Data = params[key];
        if (base64Data && base64Data.length > 100) {
          files['pricelist_images'].push({
            data: base64Data[0] || base64Data,
            index: key.replace('pricelist_image_', '')
          });
          console.log(`價目表 ${key} 已提取`);
        }
      }
      // 處理商品圖片
      else if (key.startsWith('product_') && key.includes('_image_')) {
        const matches = key.match(/product_(\d+)_image_(\d+)/);
        if (matches) {
          const productId = matches[1];
          const imageIndex = matches[2];
          
          if (!files[productId]) {
            files[productId] = [];
          }
          
          const base64Data = params[key];
          if (base64Data && base64Data.length > 100) {
            files[productId].push({
              data: base64Data[0] || base64Data,
              index: imageIndex
            });
            console.log(`商品${productId}圖片${imageIndex} 已提取`);
          }
        }
      }
    }
    
    console.log('檔案提取完成，共 ' + Object.keys(files).length + ' 類');
  } catch (error) {
    console.error('提取檔案錯誤: ' + error.toString());
  }
  
  return files;
}

// ===== 處理環境圖和價目表圖片 =====
function processEnvAndPriceImages(files, params, mainFolder) {
  const result = {
    envImageLinks: [],
    priceListLinks: []
  };
  
  try {
    // 處理環境圖
    if (files['env_images'] && files['env_images'].length > 0) {
      console.log('找到環境圖，數量: ' + files['env_images'].length);
      
      const envFolder = mainFolder.createFolder('環境圖');
      console.log('環境圖資料夾創建成功');
      
      files['env_images'].forEach((fileData, index) => {
        try {
          console.log(`處理第${index + 1}張環境圖`);
          
          const file = uploadBase64Image(
            fileData.data,
            `環境圖_${index + 1}.jpg`,
            envFolder
          );
          
          if (file) {
            result.envImageLinks.push(file.getUrl());
            console.log(`環境圖${index + 1} 上傳成功`);
          }
        } catch (error) {
          console.error(`環境圖${index + 1} 上傳失敗: ` + error.toString());
        }
      });
    }
    
    // 處理價目表
    if (files['pricelist_images'] && files['pricelist_images'].length > 0) {
      console.log('找到價目表，數量: ' + files['pricelist_images'].length);
      
      const pricelistFolder = mainFolder.createFolder('價目表');
      
      files['pricelist_images'].forEach((fileData, index) => {
        try {
          console.log(`處理第${index + 1}張價目表`);
          
          const file = uploadBase64Image(
            fileData.data,
            `價目表_${index + 1}.jpg`,
            pricelistFolder
          );
          
          if (file) {
            result.priceListLinks.push(file.getUrl());
            console.log(`價目表${index + 1} 上傳成功`);
          }
        } catch (error) {
          console.error(`價目表${index + 1} 上傳失敗: ` + error.toString());
        }
      });
    }
  } catch (error) {
    console.error('處理環境圖/價目表錯誤: ' + error.toString());
  }
  
  return result;
}

// ===== 處理商品圖片 =====
function processImages(files, params, mainFolder) {
  const imageLinks = {};
  
  try {
    console.log('開始處理商品圖片');
    
    for (let productId in files) {
      // 跳過環境圖和價目表
      if (productId === 'env_images' || productId === 'pricelist_images') {
        continue;
      }
      
      console.log('處理商品ID: ' + productId);
      const productName = params[`productName_${productId}`] || `商品${productId}`;
      
      const productFolder = mainFolder.createFolder(`商品_${productName}`);
      imageLinks[productId] = [];
      
      files[productId].forEach((fileData, index) => {
        try {
          console.log(`處理商品${productId}的第${index + 1}張圖片`);
          
          const file = uploadBase64Image(
            fileData.data,
            `${productName}_圖片${index + 1}.jpg`,
            productFolder
          );
          
          if (file) {
            imageLinks[productId].push(file.getUrl());
            console.log(`商品${productId}圖片${index + 1} 上傳成功`);
          }
        } catch (error) {
          console.error(`商品${productId}圖片${index + 1} 上傳失敗: ` + error.toString());
        }
      });
    }
  } catch (error) {
    console.error('處理商品圖片錯誤: ' + error.toString());
  }
  
  return imageLinks;
}

// ===== 上傳 Base64 圖片到 Drive =====
function uploadBase64Image(base64String, fileName, folder) {
  try {
    if (!base64String || base64String.length < 100) {
      console.log('Base64 字串無效或太短');
      return null;
    }
    
    console.log('Base64 字串長度: ' + base64String.length);
    
    let mimeType = 'image/jpeg';
    let base64Data = base64String;
    
    // 如果有 data URL prefix，移除它
    if (base64String.indexOf(',') > -1) {
      const parts = base64String.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
      base64Data = parts[1];
      console.log('提取 MIME 類型: ' + mimeType);
    }
    
    // 解碼 Base64
    console.log('開始解碼 Base64...');
    const decodedData = Utilities.base64Decode(base64Data);
    console.log('解碼成功，數據大小: ' + decodedData.length + ' bytes');
    
    // 創建 Blob
    const blob = Utilities.newBlob(decodedData, mimeType, fileName);
    console.log('Blob 創建成功');
    
    // 上傳到 Drive
    console.log('開始上傳到 Drive...');
    const file = folder.createFile(blob);
    console.log('上傳成功');
    
    // 設定分享權限
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    console.log('權限設定完成');
    
    return file;
  } catch (error) {
    console.error('uploadBase64Image 錯誤: ' + error.toString());
    console.error('錯誤堆疊: ' + error.stack);
    return null;
  }
}

// ===== 創建商家主資料夾 =====
function createMainFolder(params) {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const storeName = (params.storeName || '未命名店家').replace(/[<>:"/\\|?*]/g, '_');
  const branchName = params.branchName ? `_${params.branchName}` : '';
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyyMMdd_HHmmss');
  const mainFolderName = `${storeName}${branchName}_${timestamp}`;
  return folder.createFolder(mainFolderName);
}

// ===== 取得或創建 Sheet =====
function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName('商家資料');
  
  if (!sheet) {
    sheet = ss.insertSheet('商家資料');
    const headers = [
      '提交時間', '店家類型', '店家名稱', '分店名稱', '聯絡人', '聯絡Email',
      '聯絡電話', '店家地址', '地址補充', '服務類別', '服務項目',
      '起跳金額', '最高金額', '營業日', '營業時間', '營業時間補充',
      '公休日', '公休日補充', '官方網站', 'Facebook', 'LINE', 'Instagram',
      'Google商家連結', '連結備註', '商家介紹', '環境圖連結', '價目表連結',
      '商品資料', '商品圖片連結'
    ];
    sheet.appendRow(headers);
    
    // 格式化表頭
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
  }
  
  return sheet;
}

// ===== 準備寫入 Sheet 的資料 =====
function prepareRowData(params, productImageData, envAndPriceData) {
  const timestamp = new Date();
  
  // 處理商品資料
  let productsText = '';
  let productImagesText = '';
  
  for (let i = 1; i <= 20; i++) {
    const productName = params[`productName_${i}`];
    if (productName) {
      const productPrice = params[`productPrice_${i}`] || '';
      const productDesc = params[`productDescription_${i}`] || '';
      
      productsText += `【商品${i}】\n`;
      productsText += `名稱: ${productName}\n`;
      productsText += `價格: ${productPrice}\n`;
      productsText += `描述: ${productDesc}\n\n`;
      
      if (productImageData[i] && productImageData[i].length > 0) {
        productImagesText += `【商品${i}】\n`;
        productImageData[i].forEach(link => {
          productImagesText += link + '\n';
        });
        productImagesText += '\n';
      }
    }
  }
  
  return [
    timestamp,
    params.storeType || '',
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
    envAndPriceData.envImageLinks.join('\n'),
    envAndPriceData.priceListLinks.join('\n'),
    productsText.trim(),
    productImagesText.trim()
  ];
}

// ===== 查詢功能 =====
function handleQuery(email) {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const records = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[5] === email) {  // 聯絡Email 在第 6 欄 (index 5)
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

function handleAdminQuery() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const records = [];
    for (let i = 1; i < data.length; i++) {
      records.push(parseRowToObject(headers, data[i]));
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        data: records 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

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


