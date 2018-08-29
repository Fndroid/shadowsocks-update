# shadowsocks-update

一个用于通过服务商提供的Surge托管更新Shadowsocks（Windows）节点的工具。

## 安装

```
npm install -g shadowsocks-update
```

## 使用

1. 进入Shadowsocks目录
2. 创建配置文件``update.json``:
    ```json
    {
        "providers": [
            "https://xxx.xxx.com",
            "https://yyy.yyy.com"
        ],
        "filter": [
            "HK",
            "TW"
        ]
    }
    ```
    > 网址为Surge托管地址
    > filter为保留关键字
3. 运行命令
    ```
    ssu
    ```

## 更新成功

可以通过如下操作刷新节点：
- 重启Shadowsocks客户端
- 双击小飞机进入节点列表，点击确定

## 错误

请提交issue