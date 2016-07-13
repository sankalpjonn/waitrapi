import argparse
import json
import requests


def getConfigObject(instance):
    configObj = {}
    if instance == "local":
        configObj['appid'] = 'waitrtestappid'
        configObj['serverurl'] = 'http://localhost:1337/waitr'
        configObj['restapikey'] = 'waitrtestrestapikey'
    return configObj


def getMenuData(filePath, sheet_index):
    from xlrd import open_workbook

    book = open_workbook(filePath)
    sheet = book.sheet_by_index(sheet_index)

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
        dict_list.append(d)

    return dict_list

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('-fp', '--filepath', required=True)
    parser.add_argument('-i', '--instance', required=True)
    parser.add_argument('-b', '--businessid', required=True)
    args = vars(parser.parse_args())
    menuDataList = getMenuData(args['filepath'], 0)
    parseBatchUploadList = []
    for menuData in menuDataList:
        businessIdPointer = {
            "__type": "Pointer",
            "className": "Business",
            "objectId": args['businessid']
        }
        menuData['businessId'] = businessIdPointer
        parseBatchUploadItem = {"method": "POST", "path": "/waitr/classes/Menu", "body": menuData}
        parseBatchUploadList.append(parseBatchUploadItem)
    configObj = getConfigObject(args['instance'])
    headers = {"X-Parse-Application-Id": configObj['appid'], "Content-Type": "application/json", "X-Parse-REST-API-Key": configObj['restapikey']}
    url = "{}/batch".format(configObj['serverurl'])
    parseRes = requests.post(url, headers=headers, data=json.dumps({"requests": parseBatchUploadList}))
    print parseRes.json()
