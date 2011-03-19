/**
naruto donwload
*/

/* helper function*/
/**
 * Left-pad a number with zeros so that it's at least the given
 * number of characters long
 * @param n   The number to pad
 * @param len The desired length
 */
function leftPad(n, len) {
    return (new Array(len - String(n).length + 1)).join("0").concat(n);
}


var url = 'http://mangastream.com/read/naruto/91687110/1';
//var url = 'http://mangastream.com/read/one_piece/67205412/1';
//var url = 'http://mangastream.com/read/bleach/50347159/1';
//var url = 'http://google.com/read/bleach/50347159/1';

//console.log(phantom.args.length);

if (phantom.args[0]) {
   url = phantom.args[0];   
}

var p_status = '';
var p_page = '';
// next page loaded, we use phantom.state to propagate next page URL
if (phantom.state.length !== 0) {
  p_status = /^status:(.*?)\|/.exec(phantom.state)[1];
  p_page = /page:(.*?)$/.exec(phantom.state)[1];
  if (p_status == 'nextpage')
    url = p_page;
  else if (p_status == 'loading')
    console.log('Houston, our page has arrived');
  
  console.log('phantomjs reinvoked with URL: ' + p_page + ' and status: ' + p_status);
  console.log('state: '+phantom.state);
  
} else
  console.log('phantomjs invoked with URL: ' + url);

var url_parts = /(.*?)(\/read\/.*?\/\d+\/)(\d+|end)$/.exec(url);
var base_url = url_parts[1]
var base_manga_url = url_parts[2];
var cur_page = url_parts[3];

var manga_name=/\/read\/(.*?)\/\d+\//.exec(base_manga_url)[1];

if (cur_page == 'end') {
  console.log('No more page');
  phantom.exit();
}

console.log('base manga url: ' + base_manga_url + ' cur_page: ' + cur_page );

if (phantom.state.length === 0) {
    //phantom.state = {'status': 'loading', 'page': base_url + base_manga_url + cur_page};
    phantom.state = 'status:loading|page:' + base_url + base_manga_url + cur_page;
    phantom.userAgent = 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Ubuntu/10.10 Chromium/11.0.696.0 Chrome/11.0.696.0 Safari/534.24';
    console.log('Loading URL: ' + base_url + base_manga_url + cur_page + ' ...');    
    phantom.open(base_url + base_manga_url + cur_page);
    
} else /*if (p_status == 'loading')*/ {
    // Houston, we've got our page!
    console.log('URL loaded: ' + base_url + base_manga_url + cur_page);
    
    // load 'em boys
    // check any href matching "/read/blahblah/1" or "/read/blahblah/end"
    var next_page_url = document.querySelectorAll('a[href*="'+ base_manga_url + '"]');    
    if (next_page_url.length>2)      
      next_page_url = next_page_url[1];
    else if (next_page_url.length>1) 
      next_page_url = next_page_url[0];
    else {
      console.log('got next page url lenght: ' + next_page_url.length);
      phantom.exit(1);
    }
        
    next_page_url = next_page_url.href;
    
    console.log('next_page_url: ' + next_page_url);
    // next page
    url_parts = /(.*?)(\/read\/.*?\/\d+\/)(\d+|end)$/.exec(next_page_url);
    next_page = url_parts[3];
    
    //clip the page, but this going to reload the page. not good
    //html>body>div#contentwrap>div#pagewrapper>div#page>table>tbody>tr>td>div
    var this_page_img = document.querySelector('div.pagenav + div');
    if (this_page_img){
      // print widht and height, set view port, html.body.style.display = none, this_page_img.style.display=visible
      //console.log('page im legnth: ' + this_page_img.length);
      //this_page_img = this_page_img[0];
      //console.log('page im: ' + this_page_img);
      i_width = document.defaultView.getComputedStyle(this_page_img, null).getPropertyValue("width").replace(/px/, '');
      i_height = document.defaultView.getComputedStyle(this_page_img, null).getPropertyValue("height").replace(/px/, '');
      //console.log('page img content:' +this_page_img.innerHTML);
      console.log('width: ' + i_width + ' height: ' + i_height);
      phantom.viewportSize = {width: i_width, height: i_height }
      
      // move to top left      
      this_page_img.style.position='absolute';
      this_page_img.style.top='0px';
      this_page_img.style.left='0px';
      
      // remove right ad
      document.querySelector('div#rightad').style.display='none';      
      
      // reset pagewrapper widht
      pagewrapper = document.querySelector('div#pagewrapper');
      pagewrapper.style.width=i_width;
      pagewrapper.style.height=i_height;
      
      // try alter body
      document.body.style.width=i_width;
      document.body.style.height=i_height;
      
      // finally
      console.log('saving ' + manga_name + '_' + leftPad(cur_page, 2) + '.png');
      phantom.render(manga_name + '_' + leftPad(cur_page, 2) + '.png');
    }
    //phantom.exit(0);
    // ---
        
    //var list = document.querySelectorAll('a[href*="'+ base_manga_url + '"] > img');
        
    /*for (var i in list) {
        //console.log('checking image width, should be more than 900: ' + list[i].width + ' x ' + list[i].height + list[i].src);
	console.log(list[i].textContent);
	//if (list[i].width >= 900){
	  // print out and hopefully wget will download it
	  console.log(list[i].src)	  
	//}
    }*/
    console.log('next');
   // phantom.state[1] = 'naruto-2';
    if (next_page != 'end'){
      //phantom.state = {'status': 'nextpage', 'page': base_url + base_manga_url + next_page};
      console.log('Preparing next page: ' + base_url + base_manga_url + next_page);
      phantom.state = 'status:nextpage|page:' + base_url + base_manga_url + next_page;
      phantom.open(base_url + base_manga_url + next_page);      
    } else
      phantom.exit();
}