#-*- coding: utf-8 -*-
from xml.dom.minidom import parse
import re

JSON_START = "{"
JSON_CLOSE = "}"

def handlePair(key, value):
    return ("%s:" + JSON_START + "defaultValue:%s,description:\"%s\"" + JSON_CLOSE) % (key,value,"no_description")

def handleParamValues(params, values):
    params = params.split("|")
    values = values.split("|")
    ret = []
    count = 0
    maxCount = len(values) - 1

    for param in params:
        if count <= maxCount:
            value = values[count]
        else:
            value = "no_default_value"

        # add quote if not numbers
        # not leading with zero, leading zero has special meaning in javascript
        if not re.match("^[^0]\d+$", value):
            value = "\"%s\"" % value

        ret.append(handlePair(param,value))
        count += 1
    return ",".join(ret)

def handleItem(item):
    content = "\"%s\":" + JSON_START + "category:\"%s\",description:\"%s\",supportMethod:\"%s\"%s" + JSON_CLOSE
    entrance = "/" + item.getAttribute("api")
    label = item.getAttribute("label").split(":")
    category = label[0]
    description = re.sub('\s','',label[1])
    method = re.sub('\s','',item.getAttribute("method"))
    paramlist = item.getAttribute("param").strip()
    valuelist = item.getAttribute("value").strip()
    if len(paramlist) > 0:
        params = (",supportParams:" + JSON_START + "%s" + JSON_CLOSE) % handleParamValues(paramlist,valuelist)
    else:
        params = ""
    return content % (entrance, category, description, method, params)

def handleItems(items):
    ret = []
    for item in items:
        ret.append(handleItem(item))
    return ",".join(ret)

def handleData(dom):
    ret = []
    ret.append(JSON_START)
    ret.append(handleItems(dom.getElementsByTagName("item")))
    ret.append(JSON_CLOSE)
    return "".join(ret)

def main():
    apidata = parse('data.xml')
    jsondata = handleData(apidata)
    jsondata = re.sub(r'\"no_description\"',"QQWB._const.API_NO_DESCRIPTION",jsondata);
    jsondata = re.sub(r'\"no_default_value\"',"QQWB._const.API_NO_DEFAULT_VALUE",jsondata);
    jsondata = re.sub(r'\"get\"',"QQWB._const.HTTP_METHOD_GET",jsondata);
    jsondata = re.sub(r'\"post\"',"QQWB._const.HTTP_METHOD_POST",jsondata);
    jsondata = re.sub(r'\"get|post\"',"QQWB._const.HTTP_METHOD_GET_OR_POST",jsondata);
    jsondata = re.sub(unicode('\"时间线\"','utf-8'),"QQWB._const.API_CATEGORY_TIMELINE",jsondata);
    jsondata = re.sub(unicode('\"微博相关\"','utf-8'),"QQWB._const.API_CATEGORY_WEIBO",jsondata);
    jsondata = re.sub(unicode('\"账户相关\"','utf-8'),"QQWB._const.API_CATEGORY_ACCOUNT",jsondata);
    jsondata = re.sub(unicode('\"关系链相关\"','utf-8'),"QQWB._const.API_CATEGORY_RELATION",jsondata);
    jsondata = re.sub(unicode('\"私信相关\"','utf-8'),"QQWB._const.API_CATEGORY_SIXIN",jsondata);
    jsondata = re.sub(unicode('\"搜索相关\"','utf-8'),"QQWB._const.API_CATEGORY_SEARCH",jsondata);
    jsondata = re.sub(unicode('\"热度趋势\"','utf-8'),"QQWB._const.API_CATEGORY_TRENS",jsondata);
    jsondata = re.sub(unicode('\"查看数据\"','utf-8'),"QQWB._const.API_CATEGORY_QUERY",jsondata);
    jsondata = re.sub(unicode('\"数据收藏\"','utf-8'),"QQWB._const.API_CATEGORY_FAVORITE",jsondata);
    jsondata = re.sub(unicode('\"话题相关\"','utf-8'),"QQWB._const.API_CATEGORY_TOPIC",jsondata);
    jsondata = re.sub(unicode('\"标签相关\"','utf-8'),"QQWB._const.API_CATEGORY_TAG",jsondata);
    jsondata = re.sub(unicode('\"其他\"','utf-8'),"QQWB._const.API_CATEGORY_OTHER",jsondata);
    open("json.txt","w+").write(jsondata.encode("gbk"))

if __name__ == "__main__":
    main()
