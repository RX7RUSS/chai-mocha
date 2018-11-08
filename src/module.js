const path = require('path')
module.exports = { getRemoteResources }


async function getRemoteResources(sftpClient, sftpPath, log) {
 const fileList = await sftpClient.list(sftpPath)

 if (!fileList.length) {
   throw new Error("No files in " + sftpPath);
 }

 const filePatterns = [
   // Sustainalytics
   { name: 'ref_data', pattern: /^\d\.\d\sReference\sdata/ },
   { name: 'esg_focus', pattern: /^\d\.\d\sESG\sFocus/ },

   // MorningStar
   { name: 'esg_fc', pattern: /^ESG_GROUP1_FC/ },
   { name: 'esg_fe', pattern: /^ESG_GROUP1_FE/ },
   { name: 'esg_fm', pattern: /^ESG_GROUP1_FM/ },
   { name: 'esg_oe', pattern: /^ESG_GROUP1_OE/ },
   { name: 'esg_ut', pattern: /^ESG_GROUP1_UT/ },
   { name: 'fund_basic_fc', pattern: /^FundBasic_FC/ },
   { name: 'fund_basic_fe', pattern: /^FundBasic_FE/ },
   { name: 'fund_basic_fm', pattern: /^FundBasic_FM/ },
   { name: 'fund_basic_ut', pattern: /^FundBasic_UT/ },
   { name: 'fund_basic_oe', pattern: /^FundBasic_OE/ },

   // Yodlee
   { name: 'bank_account', pattern: /_BANK_ACCT/ },
   { name: 'bank_transaction', pattern: /_BANK_TRANS/ },
   { name: 'card_account', pattern: /_CARD_ACCT/ },
   { name: 'card_statement', pattern: /_CARD_STMT/ },
   { name: 'card_transaction', pattern: /_CARD_TRANS/ },
   { name: 'crc_exch_rate', pattern: /_CRC_EXCH_RATE/ },
   { name: 'insurance_account', pattern: /_INS_ACCT/ },
   { name: 'insurance_ann', pattern: /_INS_ANN/ },
   { name: 'insurance_mutual', pattern: /_INS_MUT/ },
   { name: 'insurance_statement', pattern: /_INS_STMT/ },
   { name: 'insurance_transaction', pattern: /_INS_TRANS/ },
   { name: 'investment_account', pattern: /_INV_ACCT/ },
   { name: 'investment_transaction', pattern: /_INV_TRANS/ },
   { name: 'rew_pgm', pattern: /_REW_PGM/ },
   { name: 'unreg_user', pattern: /_UNREG_USER/ },
   { name: 'investment_holding', pattern: /_INV_HOLD/ }
 ]

 let downloadList = {}
 // For Each pattern
 for (const file of fileList) {
   for (const { name, pattern } of filePatterns) {
     if (!pattern.test(file.name)) {
       continue
     }

     if (!downloadList[name]) {
       // The file is a new name and can be directly added
       downloadList = Object.assign({}, downloadList, { [name]: file})
       continue
     }

     if (downloadList[name].modifyTime < file.modifyTime) {
       // Previously retained file is older than the current file
       downloadList[name] = file
     }
   }
 }

 for (const { name: fileName } of Object.values(downloadList)) {
   let message = `Retrieving remote file: ${fileName}`
   log.push(message)
   // winston.info(message)
   await sftpClient.fastGet(`${sftpPath}/${fileName}`, path.resolve(`${process.cwd()}/scripts/downloads/${fileName}`))
 }

 // Indicates that the associated resources have updates
 // the ETL process for that resource group should run
 return Object.keys(downloadList).length > 0
}