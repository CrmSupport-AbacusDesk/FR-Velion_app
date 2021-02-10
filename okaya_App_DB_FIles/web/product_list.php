<div class="">
    <div class="okaya-container" ng-init="getCategory(); getSubCategory();">
        <div class="cs-container">
            <div class="module-head">
                <div class="module-name">
                    <h2>PRODUCTS</h2>
                    <p>"{{totalProduct}}" Total Products</p>
                </div>

            </div>

            <div class="scroll-container">
                <div class="ss-container">
                    <table>
                        <tr>
                            <td class="ss-sticky">
                                <div class="blank1">
                                    <table class="ss-table">
                                        <tr>
                                            <th class="w50">S.No.</th>
                                            <th class="w180">Category</th>
                                            <th class="w180">Sub Category</th>
                                            <th class="">Product Name</th>
                                            <th class="w180">Product Code </th>
                                            <th class="w150 text-right">Price</th>
                                            <th class="w70">Action</th>
                                        </tr>
                                    </table>
                                </div>
                                <div class="blank1">
                                    <table class="ss-table">
                                        <tr>
                                            <th class="w50 pr-search">&nbsp;</th>
                                            <th class="pr-search w180">
                                                <div style="display: flex;">
                                                    <md-select placeholder="Select Category" name="category" ng-model="filter.category" md-on-close="clearSearchTerm('category')" data-md-container-class="selectdemoSelectHeader" class="area-border select-bg" ng-change="getProductList(pageLimit,start);">
                                                        <md-select-header class="demo-select-header">
                                                            <input ng-model="md_search.category" onkeydown="mdSelectOnKeyDownOverride(event)" type="search" placeholder="Search By Category" class="demo-header-searchbox md-text" />
                                                        </md-select-header>
                                                        <md-optgroup label="Lead Category">
                                                            <md-option value="">All</md-option>
                                                            <md-option ng-value="row.category" ng-repeat="row in categoryList | filter:md_search.category">{{!row.category?'N/A':row.category}}</md-option>
                                                        </md-optgroup>
                                                    </md-select>
                                                </div>
                                            </th>

                                            <th class="pr-search w180">
                                                <div style="display: flex;">
                                                    <md-select placeholder="Select Sub-Category" name="sub_category" ng-model="filter.sub_category" md-on-close="clearSearchTerm('sub_category')" data-md-container-class="selectdemoSelectHeader" class="area-border select-bg" ng-change="getProductList(pageLimit,start)">
                                                        <md-select-header class="demo-select-header">
                                                            <input ng-model="md_search.sub_category" onkeydown="mdSelectOnKeyDownOverride(event)" type="search" placeholder="Search By Category" class="demo-header-searchbox md-text" />
                                                        </md-select-header>
                                                        <md-optgroup label="Lead Category">
                                                            <md-option value="">All</md-option>
                                                            <md-option ng-value="row.sub_category" ng-repeat="row in subCategoryList | filter:md_search.sub_category">{{!row.sub_category?'N/A':row.sub_category}}</md-option>
                                                        </md-optgroup>
                                                    </md-select>
                                                </div>
                                            </th>

                                            <th class="pr-search">
                                                <input type="text" name="" placeholder="Product Name" ng-model="filter.product_name" ng-keyup="$event.keyCode == 13 ?getProductList(pageLimit,start) : null">
                                            </th>
                                            <th class="pr-search w180">
                                                <input type="text" name="" placeholder="Product Code" ng-model="filter.product_code" ng-keyup="$event.keyCode == 13 ?getProductList(pageLimit,start) : null">
                                            </th>
                                            <th class="w150 text-center pr-search"></th>
                                            <th class="w70 text-center">
                                                <div class="action-hover-default hover-center">
                                                    <ul>
                                                        <li class="edit text-center">
                                                            <a ng-click="getProductList(pageLimit,start)">
                                                                <i class="fa fa-search"></i>
                                                            </a>
                                                        </li>
                                                        <li class="edit text-center">
                                                            <a ng-click="filter = {}; getProductList(pageLimit,start);">
                                                                <i class="fa fa-refresh"></i>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
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
                                        <tr ng-repeat="data in productList">
                                            <td class="w50">{{ ((page_number- 1) * pageLimit) + ($index + 1) }}</td>
                                            <td class="w180">{{!data.category?'N/A':data.category}}</td>
                                            <td class="w180">{{!data.sub_category?'N/A':data.sub_category}}</td>
                                            <td class="">{{!data.product_name?'N/A':data.product_name}}</td>
                                            <td class="w180">{{!data.product_code?'N/A':data.product_code}}</td>
                                            <td class="w150 text-right">Rs. {{!data.price?'0':data.price | number : 0}} /-</td>
                                            <td class="w70">
                                                <div class="action-hover-default hover-center">
                                                    <ul>
                                                        <li class="edit" ng-if="($root.access_level ) || (($root.access_level == 2) && ($root.access_of_module['2'].edit == 1))">
                                                            <a href="#/edit_product/{{data.ecrpt_id}}">
                                                                <i class="fa fa-pencil"></i>
                                                            </a>
                                                        </li>
                                                        <li class="delete" ng-if="($root.access_level ) || (($root.access_level == 2) && ($root.access_of_module['2'].delete == 1))">
                                                            <a ng-click="deleteProduct(data.id,$index)">
                                                                <i class="fa fa-trash-o"></i>
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>



                <div ng-if="totalProduct > pageLimit">
                    <div class=" col-sm-12 text-right">
                        <div class="flex-pagination">
                            <ul class="row pagination">
                                <li ng-click="(start/pageLimit)+1 != 1?getProductList(pageLimit,0):''" ng-class="{disable : (start/pageLimit)+1 == 1}">
                                    <a href="" class="pre-next">FIRST</a>
                                </li>
                                <li ng-click="(start/pageLimit)+1 != 1?getProductList(pageLimit,start-pageLimit):''" ng-class="{disable : (start/pageLimit)+1 == 1}">
                                    <i class="material-icons icon-box">chevron_left</i>
                                </li>
                                <li>
                                    <a href="" class="pre-next" style="cursor:default;">{{(start/pageLimit)+1}}/{{total_btn}}</a>
                                </li>
                                <li ng-click="(start/pageLimit)+1 != total_btn?getProductList(pageLimit,start+pageLimit):''" ng-class="{disable :(start/pageLimit)+1 == total_btn}">
                                    <i class="material-icons icon-box">chevron_right</i>
                                </li>
                                <li ng-click="(start/pageLimit)+1 != total_btn?getProductList(pageLimit,((total_btn*pageLimit)-pageLimit) ):''" ng-class="{disable :(start/pageLimit)+1 == total_btn}">
                                    <a href="" class="pre-next">LAST</a>
                                </li>
                            </ul>
                            <ul class="search-page">
                                <li>
                                    <label>Enter Page Number :-</label>
                                </li>
                                <li>
                                    <input ng-keyup="($event.keyCode == 13 && page_number )?getLeadList(pageLimit,((page_number*pageLimit)-pageLimit),filter.status) : null" ng-init="page_number = (start/pageLimit)+1" type="number" ng-model="page_number" min="1" max="{{total_btn}}" ng-keyup="$event.keyCode == 13 ?getProductList(pageLimit,((page_number*pageLimit)-pageLimit)) : null" style="height: 30px;">
                                </li>
                                <li ng-click="(start/pageLimit)+1 != total_btn?getProductList(pageLimit,((page_number*pageLimit)-pageLimit) ):''">
                                    <a href="" class="pre-next next-btn" ng-if="page_number">GO</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>


                <!--  IF PRODUCT DATA NOT FOUND SECTION START -->
                <div class="table" ng-if="data_not_found">
                    <div class="no-found" style="text-align: center;">
                        <img src="assets/img/okaya-img/no_found.svg" style="height: 200px; margin-top: 30px;">
                        <p>Data Not Found... </p>
                    </div>
                </div>
                <!--  IF PRODUCT DATA NOT FOUND SECTION START -->

                <div class="h200"></div>
            </div>
        </div>
    </div>


    
    <div class="csm-footer">
        <a class="cs-add" data-toggle="modal" data-target="#import_product">
            <i class="material-icons">upload</i>
        </a>

        <a class="cs-add" href="#/add_product">
            <i class="material-icons">add</i>
        </a>
    </div>




</div>




<!--  Product Import Modal Start -->
<div class="modal fade add-pop-form" id="import_product" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-body">
                <div class="body-middle-part" style="height: inherit;">
                    <div class="pop-heading">
                        <h2>IMPORT PRODUCT CSV</h2>
                    </div>


                    <form name="upload_excel" action="http://okaya.abacusdesk.com/index.php/okaya/import/importOldLeadData" method="post" enctype="multipart/form-data">
                        <div class="import">
                            <label>
                                Select file
                                <input type="file" name="file" id="file" class="input-large" required>
                            </label>

                            <p>Supported file type :- &nbsp;&nbsp;&nbsp; .CSV (<a href="./assets/sample_product.csv">Download sample file</a>)</p>

                            <button type="submit" class="btn cs-btn pull-right">upload</button>

                        </div>
                    </form>

                </div>
            </div>


            <div class="modal-footer" style="padding: 0px !important;">
                <ul class="no-padding">
                    <li>
                        <button type="button" class="cncl" data-dismiss="modal">Close</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</div>
<!-- Product Import Modal End -->