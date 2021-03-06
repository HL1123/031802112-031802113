var Main = {
    watch: {
        filterText(val) {
            this.$refs.tree.filter(val);
        }
    },

    methods: {
        filterNode(value, data) {
            if (!value) return true;
            return data.label.indexOf(value) !== -1;
        },

        processInput() {
            document.getElementById('tree').removeAttribute("hidden");
            this.data = [];
            this.treeCount = -1;
            id = 0;
            type = 0;
            root = null;
            if (this.inputData) {
                lines = this.inputData.split("\n"); // 拆分输入行
                flag = 0;
                // console.log(lines);
                for (line in lines) {
                    parts = lines[line].split("："); // 0 为数据类型，1 为数据内容
                    // console.log(parts);
                    if (parts[0] === "导师") { // 建立新树
                        flag = 1;
                        type = 0; // 重置学生类型
                        if (root) {
                            for (tree = 0; tree <= this.treeCount; tree++) {
                                this.associate(this.data[tree], root);
                            }
                        }
                        root = {
                            id: id++,
                            label: parts[1],
                            children: [],
                            level: 0,
                            info: null
                        };
                        this.data.push(root); // 插入导师根节点
                        this.treeCount++;
                    } else if (this.treeCount >= 0) {
                        if (parts[0].search(/博士生|硕士生|本科生/) != -1) { // 该行为学生
                            newChild = {
                                id: id++,
                                label: parts[0],
                                children: [],
                                level: 1,
                                info: null
                            };
                            this.data[this.treeCount].children.push(newChild); // 添加学生类型结点
                            people = parts[1].split("、"); // 分隔学生姓名
                            // console.log(people);
                            for (person in people) {
                                newLeaf = {
                                    id: id++,
                                    label: people[person],
                                    children: [],
                                    level: 2,
                                    info: null
                                };
                                this.data[this.treeCount].children[type].children.push(newLeaf); // 添加学生叶节点
                            }
                            type++;
                        } else if (parts.length === 2) {
                            if (this.data[this.treeCount].label === parts[0]) {
                                this.data[this.treeCount].info = parts[1];
                            }
                            for (itype = 0; itype < type; itype++) {
                                for (person in this.data[this.treeCount].children[itype].children) {
                                    if (this.data[this.treeCount].children[itype].children[person].label === parts[0]) {
                                        this.data[this.treeCount].children[itype].children[person].info = parts[1];
                                    }
                                }
                            }
                        } else if (parts[0] != "" && parts[0] != "\r") {
                            temp = parseInt(line) + 1;
                            this.$alert("请检查输入格式是否正确并尝试重新输入。第 " + temp + " 行可能有错。", '输入错误');
                            flag = -1;
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }
                if (flag == 0) {
                    this.$alert("请检查输入格式是否正确并尝试重新输入。", '输入错误');
                }
                else if (flag == 1) {
                    this.$message("树建立成功！");
                }
            }
            if (root) {
                for (tree = 0; tree <= this.treeCount; tree++) {
                    this.associate(this.data[tree], root);
                }
            }
            // console.log(this.data);
        },

        clearData() {
            this.inputData = '';
        },

        retrieveInfo(data) {
            this.$alert(data.label + "：" + data.info);
        },

        append(node, data) {
            this.temp = data;
            this.actionType = 0;
            this.form.name = "";
            this.form.info = "";
            if (data.level == 1) {
                this.dialog1Visible = true;
            }
            else {
                this.dialog2Visible = true;
            }
        },

        remove(node, data) {
            parent = node.parent;
            children = parent.data.children || parent.data;
            index = children.findIndex(d => d.id === data.id);
            children.splice(index, 1);
            this.$message('删除成功！');
        },

        modify(data) {
            this.temp = data;
            this.actionType = 1;
            this.form.name = data.label;
            this.form.info = data.info;
            if (data.level != 1) {
                this.dialog1Visible = true;
            }
            else {
                this.dialog2Visible = true;
            }
        },

        handleClose1() {
            this.dialog1Visible = false;
            if (this.actionType) {
                this.temp.label = this.form.name;
                this.temp.info = this.form.info;
                this.$message('修改成功！');
            } else {
                newChild = {
                    id: id++,
                    label: this.form.name,
                    children: [],
                    level: 2,
                    info: this.form.info
                };
                this.temp.children.push(newChild);
                this.$message('添加成功！');
            }
        },

        handleClose2() {
            this.dialog2Visible = false;
            if (this.actionType) {
                this.temp.label = this.form.name;
                this.$message('修改成功！');
            } else {
                newChild = {
                    id: id++,
                    label: this.form.name,
                    children: [],
                    level: 1,
                    info: null
                };
                this.temp.children.push(newChild);
                this.$message('添加成功！');
            }
        },

        elInFile(f, fs) {
            this.read(f.raw);
        },

        read(f) {
            let rd = new FileReader();
            rd.onload = e => {  //this.readAsArrayBuffer函数内，会回调this.onload函数。在这里处理结果
                this.inputData = rd.reading({ encode: 'UTF-8' || 'GBK' });
            };
            rd.readAsBinaryString(f);
        },

        associate(node, root) {
            console.log(node);
            if ((node.level == 2) && node.label == root.label) {
                node.id = root.id;
                node.level = 3;
                node.children = root.children;
                if (root.info) {
                    node.info = root.info;
                }
                index = this.data.findIndex(d => d.id === root.id);
                this.data.splice(index, 1);
                this.treeCount--;
                return 1;
            }
            for (child in node.children) {
                if (this.associate(node.children[child], root) == 1)
                {
                    return 1;
                }
            }
        }
    },

    data() {
        return {
            treeCount: -1, // 记录根节点个数
            inputData: '',
            filterText: '',
            data: [], // 存放树结点
            dialog1Visible: false,
            dialog2Visible: false,
            actionType: 0,
            temp: null,
            fileList: [],
            form: {
                name: '',
                info: ''
            },
            defaultProps: {
                children: 'children',
                label: 'label'
            }
        };
    },

    beforeCreate() {
        /* 读取文件（自定义函数） */
        FileReader.prototype.reading = function ({ encode } = pms) {
            let bytes = new Uint8Array(this.result);    //无符号整型数组
            let text = new TextDecoder(encode).decode(bytes);
            return text;
        };
        /* 重写readAsBinaryString函数 */
        FileReader.prototype.readAsBinaryString = function (f) {
            this.readAsArrayBuffer(f);  //内部会回调this.onload方法
        };
    }
};
var Ctor = Vue.extend(Main)
new Ctor().$mount('#app')