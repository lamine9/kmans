$(document).ready(() => {
  const { ipcRenderer } = require("electron");

  //search by date
  $("#btnSearchByDate").on("click", () => {
    if (
      new Date($("#from").val()).getTime() > new Date($("#to").val()).getTime()
    ) {
      alert(
        "Veuillez revoir les dates saisies ! (La date du debut est superieure)"
      );
    } else if (
      new Date($("#to").val()).getTime() -
        new Date($("#from").val()).getTime() >=
      31 * 24 * 60 * 60 * 1000
    ) {
      alert("L'intervalle ne doit pas depassé 31 jours !");
    } else {
      $("#table_body").children().remove();
      let from = new Date($("#from").val()).getTime();
      let to = new Date($("#to").val()).getTime();
      let dates = [from, to];
      ipcRenderer.send("FilterSalesByDates", dates);
    }
  });

  //bind products from db
  ipcRenderer.send("mainWindowLoaded");
  ipcRenderer.on("sales:bind", function (evt, result) {
    let total = 0;
    for (let i = 0; i < result.length; i++) {
      let date = new Date(result[i].sale_at);
      total += result[i].sd_price * result[i].sd_quantity;
      $("#table_body").append(
        "<tr class='listsales'>" +
          "<td>" +
          result[i].prod_name +
          "</td>" +
          "<td align='center'>" +
          result[i].sd_quantity +
          "</td>" +
          "<td align='right'>" +
          result[i].sd_price.toLocaleString() +
          "</td>" +
          "<td align='right'>" +
          (result[i].sd_price * result[i].sd_quantity).toLocaleString() +
          "</td>" +
          "<td align='center'>" +
          date.getDate() +
          "/" +
          (parseInt(date.getMonth()) + 1) +
          "/" +
          date.getFullYear() +
          "</td>" +
          "<td align='center'>" +
          date.getHours() +
          ":" +
          date.getMinutes() +
          "</td>" +
          "</tr>"
      );
    }
    result = null;
    $("#table_body").append(
      "<tr> <td colspan='3' align='right'> <b> TOTAL </b> </td> <td align='right'> <b>" +
        total.toLocaleString() +
        "</b> </td> <td colspan='2'> </td> </tr>"
    );
  });
});
