<template>
  <div id="app">
    <button type="button" class="add-btn btn btn-primary" @click="add">新增</button>
    <table class="table table-bordered">
      <thead>
      <tr>
        <th width="100px"></th><th></th><th></th>
        <th></th><th></th><th></th>
        <th></th><th></th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, itemIndex) in items">
        <td>
          <select class="form-control" @change="onSelectedDrug($event, item)">
            <option value="" disabled selected>空</option>
            <option :value="drug.id" v-for="drug in drugs">{{ drug.name }}</option>
          </select>
        </td>
        <td><input type="text" class="form-control" placeholder="use" v-model="item.fill"></td>
        <td><input type="text" class="form-control" placeholder="unit" :value="getDrug(item.drug_id).unit" disabled></td>
        <td><input type="text" class="form-control" placeholder="rate" v-model="item.rate"></td>
        <td><input type="text" class="form-control" placeholder="amount" :value="item.amount" @input="onItemAmountInput($event, item)"></td>
        <td><input type="text" class="form-control" placeholder="price" disabled :value="getDrug(item.drug_id).price"></td>
        <td><input type="text" class="form-control" placeholder="money" :value="item.money" disabled></td>
        <td><button type="button" class="btn btn-danger" @click="remove(itemIndex)">刪除</button></td>
      </tr>
      <tr v-if="!items.length">
        <td colspan="8" class="empty">尚未新增任何資料</td>
      </tr>
      <tr>
        <td colspan="8" class="right">總金額：{{ totalMoney }}</td>
      </tr>
      </tbody>
    </table>
    <hr>
    <p>
    <pre>
{{$data|json}}
</pre>
    </p>
  </div>
</template>
<script>

  export default {
    data() {
      return {
        items: [],
        // 按照系統正常流程，這邊藥物應該是有個編號值的
        // 而且為了統一性，保持資料單一來源也是很重要的
        // item 就記住他用了哪個藥物的 id ，再從這裡取得是最保險的做法
        drugs: [
          { id: 1, name: 'A藥物', unit: '個', 'price': 5},
          { id: 2, name: 'B藥物', unit: '條', 'price': 6},
          { id: 3, name: 'C藥物', unit: '坨', 'price': 7},
          { id: 4, name: 'D藥物', unit: '顆', 'price': 8},
        ],
        totalMoney: 0
      }
    },
    methods: {
      add() {
        this.items.push({
          drug_id: null,
          use: '',
          rate: '',
          amount: '',
          money: 0,
          fill:''
        })
      },
      // 取得藥物
      getDrug(drugId) {
        if(!drugId) return ""
        // 透過 id 取得
        return this.drugs.find( d => d.id === drugId)
      },
      // 計算金額
      calculateMoney(item) {
        const drug = this.getDrug(item.drug_id)
        // 照你的算法～
        let money = (parseFloat(drug.price) * parseFloat(item.amount)).toFixed(2)
        // 這裡可以簡化成這樣
        item.money = isNaN(money) ? parseFloat(0.00) : money
        // 任何金額異動就重新計算總金額
        this.calculateTotalMoney()
      },
      // 計算總金額
      calculateTotalMoney() {
        // 這裡的大致意思是說，從 items 每個元素中取得其 money 值，在進行加總 (reduce)
        this.totalMoney = parseFloat(this.items.map( i => parseFloat(i.money)).reduce( (a, b) => (a + b), 0)).toFixed(2)
      },
      // 選擇藥物時
      onSelectedDrug(event, item) {
        item.drug_id = parseInt(event.target.value)
        this.calculateMoney(item)
      },
      onItemAmountInput(event, item) {
        const amount = parseFloat(event.target.value)
        // 一樣就不繼續了
        if(item.amount === amount) return
        // 檢測輸入的是否為數字
        if(this.isNumeric(event.target.value)) {
          item.amount = amount
          // 計算金額
          this.calculateMoney(item)
        } else {
          item.amount = 0
        }
      },
      remove(itemIndex) {
        // 刪除
        this.items.splice(itemIndex, 1)
        // 重新計算總金額
        this.calculateTotalMoney()
      },
      // 簡易的判斷是否為數字的 func
      isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
      }
    }
  }
</script>

<style scoped>
  body {
    padding: 30px;
  }

  .add-btn {
    margin-bottom: 10px;
  }

  .right {
    text-align: right;
  }

  .empty {
    text-align: center;
    font-size: 20px;
    color: #e2e2e2;
  }
</style>
