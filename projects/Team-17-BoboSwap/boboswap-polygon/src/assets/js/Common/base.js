

module.exports = {
  
  group: (arr) => {
    var moth = [],
    flag = 0,
    list = arr;
    var wdy = {
      title: '',
      baseTokenName: ''
    }
    for (var i = 0; i < list.length; i++) {
        var az = '';
        for (var j = 0; j < moth.length; j++) {
            if (moth[j].title == list[i]['baseTokenName']) {
                flag = 1;
                az = j;
                break;
            }
        }
        if (flag == 1) {
            var ab = moth[az];
            ab.list.push(list[i]);
            flag = 0;

        } else if (flag == 0) {
            wdy = {};
            wdy.title = list[i]['baseTokenName'];
            wdy.list = new Array();
            wdy.list.push(list[i]);
            moth.push(wdy);
        }
    }
    return moth
  },
  filerArry :(arr1, arr2) =>{
    let newArr = [];
    for (let i = 0; i < arr2.length; i++) {
      for (let j = 0; j < arr1.length; j++) {
        if (arr1[j] === arr2[i].address) {
          newArr.push(arr2[i]);
        }
      }
    }
    return newArr;
  },
}