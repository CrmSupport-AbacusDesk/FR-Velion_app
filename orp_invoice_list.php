<div class="okaya-container animated fadeIn delay-2s" >
    <div class="cs-container">
        <div class="module-head">
            <div class="module-name">
                <h2>Invoice</h2>
                <p>"{{totalData.length?totalData.length:'0'}}" Total Invoice Are Available</p>
            </div>
        </div>
        
        <div class="scroll-container ">
            <div class="ss-container">
                <table>
                    <tr>
                        <td class="ss-sticky">
                            <div class="blank1">
                                <table class="ss-table">
                                    <tr>
                                        <th class="w40 text-center">S.No.</th>
                                        <th class="w70">Customer Code</th>
                                        <th class="w180">Customer Name</th>
                                        <th class="w80">Billing Date</th>
                                        <th class="w90">Billing Number</th>
                                        <th class="w60 text-center">Item Total</th>
                                        <th class="w130">Material No./SKU</th>
                                        <th class="w220">Description</th>
                                        <th class="w60 text-center">Plant</th>
                                        <th class="w90 text-center">Total Sale QTY</th>
                                        <th class="w90 text-right">Taxable Amount</th>
                                        <th class="w90 text-right">Total Tax Amt</th>
                                        <th class="w90 text-right">Total Amt</th>
                                        <th class="w90">Sales Order Number</th>
                                        <th class="w90">Order date</th>
                                        <th class="w90 text-center">Sales Order QTY</th>
                                        <th class="w90 text-center">Unit</th>
                                    </tr>
                                </table>
                            </div>
                            <div class="blank1">
                                <table class="ss-table">
                                    <tr>
                                        <th class="w40 pr-search">&nbsp;</th>
                                        <th class="w70 pr-search">
                                            <input type="text" placeholder="Search. . ." name="type" ng-model="filter.customer_code" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.customer_code) : null">
                                        </th>
                                        <th class="w180 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w80 pr-search">
                                            <input type="date" max="{{today_date}}" placeholder="Search. . ." name="date_created" ng-model="filter.date_created" ng-change="getInvoiceList(pageLimit,0,filter.offer_status)">
                                        </th>
                                        <th class="w90 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w60 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w130 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w220 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w60 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w90 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w90 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w90 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w90 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w90 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w90 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w90 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                        <th class="w90 pr-search">
                                            <input type="text" placeholder="Search. . ." name="title" ng-model="filter.title" ng-keyup="$event.keyCode == 13 ?getInvoiceList(pageLimit,0,filter.offer_status) : null">
                                        </th>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    
                    <tr>
                        <td ng-if="!data_not_found">
                            <div class="blank2">
                                <table class="ss-table">
                                    <tr ng-repeat="row in invoiceList">
                                        <td class="w40 text-center">{{ ((page_number- 1) * pageLimit) + ($index + 1) }}</td>
                                        <td class="w70">{{row.customer_code}}</td>
                                        <td class="w180"><a href="#/orp_offer_detail">{{row.customr_name}}</a></td>
                                        <td class="w80"> {{formatDate(row.date_created) | date: 'dd-MMM-y'}}</td>
                                        <td class="w90">{{row.bill_doc}}</td>
                                        <td class="w60 text-center">{{row.bill_item}}</td>
                                        <td class="w130">{{row.material}}</td>
                                        <td class="w220">{{row.material_description}}</td>
                                        <td class="w60 text-center">{{row.plant}}</td>
                                        <td class="w90 text-center">{{row.sale_qty}}</td>
                                        <td class="w90 text-right">₹ {{row.taxable_amt | number:0}}</td>
                                        <td class="w90 text-right">₹ {{row.total_tax_amt | number:0}}</td>
                                        <td class="w90 text-right">₹ {{row.total_amt | number:0}}</td>
                                        <td class="w90">{{row.sale_order_no}}</td>
                                        <td class="w90">{{formatDate(row.order_date) | date: 'dd-MMM-y'}}</td>
                                        <td class="w90 text-center">{{row.sale_order_qty}}</td>
                                        <td class="w90 text-center">{{row.uom}}</td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
            
            
            <div ng-if="totalData > pageLimit">
                <div class=" col-sm-12 text-right">
                    <ul class="search-page">
                        <li>
                            <label>Enter Page Number :-</label>
                        </li>
                        <li>
                            <input ng-keyup="($event.keyCode == 13 && page_number )?getInvoiceList(pageLimit,((page_number*pageLimit)-pageLimit),filter.offer_status) : null" ng-init="page_number = (start/pageLimit)+1" type="number" ng-model="page_number" min="1" max="{{total_btn}}" only-num name="page_number" limit-to="3"  style="height: 30px;">
                        </li>
                        <li ng-click="(start/pageLimit)+1 != total_btn?getInvoiceList(pageLimit,((page_number*pageLimit)-pageLimit),filter.offer_status ):''">
                            <a href="" class="pre-next next-btn" ng-if="page_number">GO</a>
                        </li>
                    </ul>
                    <div class="flex-pagination">
                        <ul class="row pagination">
                            <li ng-click="(start/pageLimit)+1 != 1?getInvoiceList(pageLimit,0,filter.offer_status):''" ng-class="{disable : (start/pageLimit)+1 == 1}">
                                <a href="" class="pre-next">FIRST</a>
                            </li>
                            <li ng-click="(start/pageLimit)+1 != 1?getInvoiceList(pageLimit,start-pageLimit,filter.offer_status):''" ng-class="{disable : (start/pageLimit)+1 == 1}">
                                <i class="material-icons icon-box">chevron_left</i>
                            </li>
                            <li>
                                <a href="" class="pre-next" style="cursor:default;">{{(start/pageLimit)+1}}/{{total_btn}}</a>
                            </li>
                            <li ng-click="(start/pageLimit)+1 != total_btn?getInvoiceList(pageLimit,start+pageLimit,filter.offer_status):''" ng-class="{disable :(start/pageLimit)+1 == total_btn}">
                                <i class="material-icons icon-box">chevron_right</i>
                            </li>
                            <li ng-click="(start/pageLimit)+1 != total_btn?getInvoiceList(pageLimit,((total_btn*pageLimit)-pageLimit),filter.offer_status):''" ng-class="{disable :(start/pageLimit)+1 == total_btn}">
                                <a href="" class="pre-next">LAST</a>
                            </li>
                        </ul>
                        
                    </div>
                </div>
            </div>
            
            
            <!--  IF DATA NOT FOUND SECTION START -->
            <div class="table" ng-if="data_not_found">
                <div class="no-found" style="text-align: center;">
                    <img src="assets/img/okaya-img/no_found.svg">
                    <p> Data Not Available <a  href="#/orp_offer_add" class="link">Add New</a></p>
                </div>
            </div>
            <!--  IF DATA NOT FOUND SECTION END -->
            <div style="height: 150px;"></div>
        </div>
    </div>
</div>


