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
            type = 0;
            if (this.inputData) {
                lines = this.inputData.split("\n"); // 拆分输入行
                flag = false;
                // console.log(lines);
                for (line in lines) {
                    parts = lines[line].split("："); // 0 为数据类型，1 为数据内容
                    // console.log(parts);
                    if (parts[0] === "导师") { // 建立新树
                        flag = true;
                        type = 0; // 重置学生类型
                        newChild = {
                            label: parts[1],
                            children: [],
                            level: 0,
                            info: null
                        };
                        this.data.push(newChild); // 插入导师根节点
                        this.treeCount++;
                    } else if (this.treeCount >= 0) {
                        if (parts[0].search(/博士生|硕士生|本科生/) != -1) { // 该行为学生
                            newChild = {
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
                        } else if (parts[0] != "") {
                            temp = parseInt(line) + 1;
                            this.$alert("请检查输入格式是否正确并尝试重新输入。第 " + temp + " 行可能有错。", '输入错误');
                            flag = true;
                            break;
                        }
                    }
                    else {
                        break;
                    }
                }
                if (!flag) {
                    this.$alert("请检查输入格式是否正确并尝试重新输入。", '输入错误');
                }
            }
        },

        clearData() {
            this.inputData = '';
        },

        retrieveInfo(data) {
            this.$alert(data.label + "：" + data.info);
        },

        append(node, data) {
            this.$prompt('请输入添加内容', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({ value }) => {
                if (node.level == 1) {
                    newChild = {
                        label: value,
                        children: [],
                        level: 2,
                        info: null
                    };
                }
                else {
                    newChild = {
                        label: value,
                        children: [],
                        level: 1,
                        info: null
                    };
                }
                data.children.push(newChild);
            });
        },

        remove(node, data) {
            parent = node.parent;
            // console.log(parent);
            children = parent.data.children || parent.data;
            index = children.findIndex(d => d.label === data.label);
            children.splice(index, 1);
        },

        modify(data) {
            this.$prompt('请输入修改内容', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then(({ value }) => {
                data.label = value;
            });
        }
    },

    data() {
        return {
            treeCount: -1, // 记录根节点个数
            inputData: '',
            filterText: '',
            data: [], // 存放树结点
            defaultProps: {
                children: 'children',
                label: 'label'
            }
        };
    },
};
var Ctor = Vue.extend(Main)
new Ctor().$mount('#app')