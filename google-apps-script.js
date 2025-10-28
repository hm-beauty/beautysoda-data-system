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
      const password = e.parameter.password;
      if (password !== ADMIN_PASSWORD) {
        return createJsonResponse({
          success: false,
          message: '密碼錯誤'
        });
      }
      return handleAdminQuery();
    } else {
      return createJsonResponse({
        success: true,
        message: 'API 運作正常'
      });
    }
  } catch (error) {
    Logger.log('GET 錯誤: ' + error.toString());
    return createJsonResponse({
      success: false,
      message: error.toString()
    });
  }
}

function doPost(e) {
  try {
    Logger.log('=== doPost 開始 ===');
    
    // 檢查是否有 POST 資料
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('沒有收到 POST 資料');
    }
    
    // 解析 JSON 資料
    const data = JSON.parse(e.postData.contents);
    Logger.log('收到的欄位數量: ' + Object.keys(data).length);
    
    // 處理表單提交
    const result = processFormSubmission(data);
    
    return createJsonResponse(result);
    
  } catch (error) {
    Logger.log('POST 錯誤: ' + error.toString());
    Logger.log('錯誤堆疊: ' + error.stack);
    
    return createJsonResponse({
      success: false,
      message: '伺服器處理錯誤: ' + error.toString()
    });
  }
}

// ===== 建立 JSON 回應（修正版）=====
function createJsonResponse(data) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  
  // 使用 Apps Script 支援的方式設定 CORS
  return output;
}

// ===== 處理表單提交 =====
function processFormSubmission(data) {
  try {
    Logger.log('=== 開始處理表單 ===');
    
    // 1. 取得或創建 Sheet
    const sheet = getOrCreateSheet();
    Logger.log('Sheet 準備完成');
    
    // 2. 創建主資料夾
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyyMMdd_HHmmss');
    const storeName = (data.storeName || '未命名店家').replace(/[<>:"/\\|?*]/g, '_');
    const branchName = data.branchName ? `_${data.branchName.replace(/[<>:"/\\|?*]/g, '_')}` : '';
    const mainFolderName = `${storeName}${branchName}_${timestamp}`;
    
    const parentFolder = DriveApp.getFolderById(FOLDER_ID);
    const mainFolder = parentFolder.createFolder(mainFolderName);
    Logger.log('主資料夾創建成功: ' + mainFolderName);
    
    // 3. 處理環境圖
    let envImageLinks = [];
    const envFolder = mainFolder.createFolder('環境圖');
    
    for (let key in data) {
      if (key.startsWith('env_image_')) {
        try {
          const file = uploadBase64Image(data[key], `環境圖_${key.replace('env_image_', '')}.jpg`, envFolder);
          if (file) {
            envImageLinks.push(file.getUrl());
            Logger.log('環境圖上傳成功: ' + key);
          }
        } catch (imgError) {
          Logger.log('環境圖上傳失敗 ' + key + ': ' + imgError.toString());
        }
      }
    }
    Logger.log('環境圖處理完成，共 ' + envImageLinks.length + ' 張');
    
    // 4. 處理價目表
    let priceListLinks = [];
    if (hasAnyKey(data, 'pricelist_image_')) {
      const priceListFolder = mainFolder.createFolder('價目表');
      
      for (let key in data) {
        if (key.startsWith('pricelist_image_')) {
          try {
            const file = uploadBase64Image(data[key], `價目表_${key.replace('pricelist_image_', '')}.jpg`, priceListFolder);
            if (file) {
              priceListLinks.push(file.getUrl());
              Logger.log('價目表上傳成功: ' + key);
            }
          } catch (imgError) {
            Logger.log('價目表上傳失敗 ' + key + ': ' + imgError.toString());
          }
        }
      }
    }
    Logger.log('價目表處理完成，共 ' + priceListLinks.length + ' 張');
    
    // 5. 收集並處理商品資料
    let productsData = [];
    let productIds = new Set();
    
    // 找出所有商品 ID
    for (let key in data) {
      if (key.startsWith('productName_')) {
        const productId = key.split('_')[1];
        productIds.add(productId);
      }
    }
    
    Logger.log('找到商品數量: ' + productIds.size);
    
    // 處理每個商品
    for (let productId of productIds) {
      const productName = data[`productName_${productId}`];
      if (!productName) continue;
      
      const productPrice = data[`productPrice_${productId}`] || '';
      const productDesc = data[`productDesc_${productId}`] || '';
      
      // 處理商品圖片
      let productImageLink = '';
      const imageKey = `product_${productId}_image_0`;
      
      if (data[imageKey]) {
        try {
          const productFolder = mainFolder.createFolder(`商品_${productName.replace(/[<>:"/\\|?*]/g, '_')}`);
          const file = uploadBase64Image(data[imageKey], `${productName}_圖片.jpg`, productFolder);
          if (file) {
            productImageLink = file.getUrl();
            Logger.log(`商品${productId}圖片上傳成功`);
          }
        } catch (imgError) {
          Logger.log(`商品${productId}圖片上傳失敗: ` + imgError.toString());
        }
      }
      
      productsData.push({
        name: productName,
        price: productPrice,
        desc: productDesc,
        image: productImageLink
      });
    }
    
    Logger.log('商品處理完成，共 ' + productsData.length + ' 個');
    
    // 6. 準備寫入 Sheet 的資料
    const rowData = [
      new Date(),                                    // 提交時間
      data.storeTypes || '',                         // 店家類型
      data.storeName || '',                          // 店家名稱
      data.branchName || '',                         // 分店名稱
      data.contactPerson || '',                      // 聯絡人
      data.contactEmail || '',                       // 聯絡Email
      data.contactPhone || '',                       // 聯絡電話
      data.storeAddress || '',                       // 店家地址
      data.addressSupplement || '',                  // 地址補充
      data.selectedCategory || '',                   // 服務類別
      data.selectedSubcategories || '',              // 服務項目
      data.minPrice || '',                           // 起跳金額
      data.maxPrice || '',                           // 最高金額
      data.businessDays || '',                       // 營業日
      data.businessHours || '',                      // 營業時間
      data.businessHoursSupplement || '',            // 營業時間補充
      data.closedDays || '',                         // 公休日
      data.closedDaysSupplement || '',               // 公休日補充
      data.websiteUrl || '',                         // 官方網站
      data.facebookUrl || '',                        // Facebook
      data.lineUrl || '',                            // LINE
      data.instagramUrl || '',                       // Instagram
      data.googleBusinessUrl || '',                  // Google商家
      data.linkNotes || '',                          // 連結備註
      data.storeIntroduction || '',                  // 商家介紹
      envImageLinks.join('\n'),                      // 環境圖連結
      priceListLinks.join('\n'),                     // 價目表連結
      JSON.stringify(productsData, null, 2)          // 商品資料
    ];
    
    // 7. 寫入 Sheet
    sheet.appendRow(rowData);
    Logger.log('=== 資料寫入完成 ===');
    
    return {
      success: true,
      message: '資料提交成功！',
      folderName: mainFolderName
    };
    
  } catch (error) {
    Logger.log('處理錯誤: ' + error.toString());
    Logger.log('錯誤堆疊: ' + error.stack);
    return {
      success: false,
      message: '處理失敗: ' + error.toString()
    };
  }
}

// ===== 輔助函數 =====

// 上傳 Base64 圖片
function uploadBase64Image(base64String, fileName, folder) {
  try {
    if (!base64String || base64String.length < 100) {
      return null;
    }
    
    let mimeType = 'image/jpeg';
    let base64Data = base64String;
    
    // 移除 data URL prefix
    if (base64String.indexOf(',') > -1) {
      const parts = base64String.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      if (mimeMatch) {
        mimeType = mimeMatch[1];
      }
      base64Data = parts[1];
    }
    
    // 解碼並上傳
    const decodedData = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decodedData, mimeType, fileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file;
  } catch (error) {
    Logger.log('圖片上傳錯誤: ' + error.toString());
    return null;
  }
}

// 檢查是否有某個前綴的 key
function hasAnyKey(obj, prefix) {
  for (let key in obj) {
    if (key.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}

// 取得或創建 Sheet
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
      '商品資料'
    ];
    sheet.appendRow(headers);
    
    // 格式化表頭
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

// ===== 查詢功能 =====
function handleQuery(email) {
  try {
    if (!email) {
      return createJsonResponse({
        success: false,
        message: '請提供Email'
      });
    }
    
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const records = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[5] === email) {  // 聯絡Email 在第 6 欄
        const record = {};
        headers.forEach((header, index) => {
          record[header] = row[index];
        });
        
        // 解析商品資料
        if (row[27]) {
          try {
            record['商品列表'] = JSON.parse(row[27]);
          } catch (e) {
            record['商品列表'] = [];
          }
        }
        
        records.push(record);
      }
    }
    
    return createJsonResponse({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    Logger.log('查詢錯誤: ' + error.toString());
    return createJsonResponse({
      success: false,
      message: error.toString()
    });
  }
}

function handleAdminQuery() {
  try {
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const records = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });
      
      // 解析商品資料
      if (row[27]) {
        try {
          record['商品列表'] = JSON.parse(row[27]);
        } catch (e) {
          record['商品列表'] = [];
        }
      }
      
      records.push(record);
    }
    
    return createJsonResponse({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    return createJsonResponse({
      success: false,
      message: error.toString()
    });
  }
}
