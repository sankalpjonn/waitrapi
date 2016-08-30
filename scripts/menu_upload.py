import argparse
import json
import requests
from xlutils.copy import copy
from xlrd import open_workbook


def getConfigObject(instance):
    configObj = {}
    if instance == "local":
        configObj['appid'] = 'waitrtestappid'
        configObj['serverurl'] = 'http://localhost:1337/waitr'
        configObj['restapikey'] = 'waitrtestrestapikey'
    elif instance == "debug":
        configObj['appid'] = 'waitrtestappid'
        configObj['serverurl'] = 'http://ec2-54-191-243-202.us-west-2.compute.amazonaws.com/waitr'
        configObj['restapikey'] = 'waitrtestrestapikey'
    return configObj


def getExcelData(filePath, sheet_index):
    book = open_workbook(filePath)
    sheet = None
    try:
        sheet = book.sheet_by_index(sheet_index)
    except:
        return None, None

    # read header values into the list
    keys = [sheet.cell(0, col_index).value for col_index in xrange(sheet.ncols)]

    dict_list = []
    for row_index in xrange(1, sheet.nrows):
        d = {keys[col_index]: sheet.cell(row_index, col_index).value
             for col_index in xrange(sheet.ncols)}
        for key in d.keys():
            if d[key] == "Yes":
                d[key] = True
            if d[key] == "No":
                d[key] = False
            if isinstance(d[key], basestring):
                d[key] = d[key].strip()
            if not isinstance(d[key], bool) and not d[key]:
                del d[key]
        if d.get('sortKey') is None:
            d['sortKey'] = row_index
        dict_list.append(d)

    return dict_list, keys


def getParseBatchUploadItem(menuData):
    objectId = menuData.get('objectId')
    if objectId:
        del menuData['objectId']
        return {"method": "PUT", "path": "/waitr/classes/Menu/{}".format(objectId), "body": menuData}
    return {"method": "POST", "path": "/waitr/classes/Menu", "body": menuData}


def writeResponseToExcel(menuData, parseRes, filepath, objectIdColIndex):
    book = open_workbook(args['filepath'])
    wbook = copy(book)
    s = wbook.get_sheet(0)
    batchResponse = parseRes.json()

    cnt = 1
    for response in batchResponse:
        if response.get("success") and response['success'].get("objectId"):
            s.write(0, objectIdColIndex, 'objectId')
            s.write(cnt, objectIdColIndex, response['success']['objectId'])
        elif not response.get("success"):
            print response
        cnt += 1
    wbook.save(filepath.replace("xlsx", "xls"))


def getCustomizationForItem(titles, customizationDict):
    customizations = []
    for title in titles.split(","):
        customizationObj = customizationDict[title].copy()
        del customizationObj['title']
        values = customizationObj['values']
        customizationObj['values'] = []
        for value in values.split(","):
            customizationObj['values'].append({"name": value.split(":")[0], "price": float(value.split(":")[1])})
        customizations.append({"category": title, "customization": customizationObj})
    return customizations

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-fp', '--filepath', required=True)
    parser.add_argument('-i', '--instance', required=True)
    parser.add_argument('-b', '--businessid', required=True)
    args = vars(parser.parse_args())

    # get menu data
    menuDataList, allMenuColumns = getExcelData(args['filepath'], 0)

    #get customization data
    customizationData, allCustomizationColumns = getExcelData(args['filepath'], 1)
    customizationDict = {}
    if customizationData:
        for customization in customizationData:
            customizationDict[customization['title']] = customization

    # batch upload
    parseBatchUploadList = []
    for menuData in menuDataList:
        businessIdPointer = {
            "__type": "Pointer",
            "className": "Business",
            "objectId": args['businessid']
        }
        menuData['businessId'] = businessIdPointer
        if menuData.get("customizationId"):
            menuData["customizations"] = getCustomizationForItem(menuData['customizationId'], customizationDict)
        parseBatchUploadItem = getParseBatchUploadItem(menuData)
        parseBatchUploadList.append(parseBatchUploadItem)
    configObj = getConfigObject(args['instance'])
    headers = {"X-Parse-Application-Id": configObj['appid'], "Content-Type": "application/json", "X-Parse-REST-API-Key": configObj['restapikey']}
    url = "{}/batch".format(configObj['serverurl'])
    parseRes = requests.post(url, headers=headers, data=json.dumps({"requests": parseBatchUploadList}))
    print parseRes.json()
    writeResponseToExcel(menuData, parseRes, args['filepath'], len(allMenuColumns))
    print "completed"
