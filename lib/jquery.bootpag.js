/**
 * @preserve
 * bootpag - jQuery plugin for dynamic pagination
 *
 * Copyright (c) 2013 botmonster@7items.com
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://botmonster.com/jquery-bootpag/
 *
 * Version:  1.1 (Howie)
 *
 *
 * If you want to use items per page / total items instead of total pages
 * do not define 'total' in settings, instead define itemsPerPage and totalItems
 *
 * To toggle directional buttons such as First, Prev, Next and Last, set showHideDirections to TRUE
 *
 * To leap from page 1 to the first page of the next set, set 'leap' to TRUE
 *
 * Declare 'on' method first since we want to be listening for first event before it's triggered
 * Declare 'on' method after instantiating bootpag to skip the initial page event
 * or
 * Set 'skipInitPageEvent' to TRUE to skip the initial page event
 *
 */
//(function($, window) {
(function($) {
    'use strict';
    //$.fn.bootpag = function(options){
    $.fn.bootpag = function(options) {
        var $owner = this,
            initPageEvent = false,
            settings = $.extend({
                total: 0,
                itemsPerPage: null,
                totalItems: null,
                page: 1,
                skipInitPageEvent: false,
                maxVisible: null,
                leaps: false,
                href: 'javascript:void(0);',
                hrefVariable: '{{number}}',
                classPrefix: 'bootpag-',
                activeClass: '',
                showHideDirections: true,
                hidePagerForSinglePage: true,
                first: '&laquo;',
                prev: '&lsaquo;',
                next: '&rsaquo;',
                last: '&raquo;',
                debug: false
            }, $owner.data('settings') || {}, options || {}),
            //;
            //function renderPage($bootpag, page){
            renderPage = function($bootpag, page, button) {
                if (settings.debug) console.log('render page: ' + page);
                var lp, maxV = settings.maxVisible == 0 ? 1 : settings.maxVisible,
                    step = settings.maxVisible == 1 ? 0 : 1,
                    vis = Math.floor((page - 1) / maxV) * maxV,
                    $page = $bootpag.find('li'),
                    activeClass = (settings.activeClass) ? settings.activeClass : settings.classPrefix + 'active';
                settings.page = page = page < 0 ? 0 : page > settings.total ? settings.total : page;
                $page.removeClass('disabled ' + activeClass);
                lp = page - 1 < 1 ? 1 : settings.leaps && page - 1 >= settings.maxVisible ? Math.floor((page - 1) / maxV) * maxV : page - 1;
                // first
                $page.parent().find('.' + settings.classPrefix + 'first').toggle((page !== 1 && settings.showHideDirections) || !settings.showHideDirections);
                // prev
                $page.parent().find('.' + settings.classPrefix + 'prev').toggleClass('disabled', page === 1).attr('data-lp', lp).find('a').attr('href', href(lp)).toggle((page !== 1 && settings.showHideDirections) || !settings.showHideDirections);
                var step = settings.maxVisible == 1 ? 0 : 1;
                lp = page + 1 > settings.total ? settings.total : settings.leaps && page + 1 < settings.total - settings.maxVisible ? vis + settings.maxVisible + step : page + 1;
                if (settings.debug) {
                    var aa = page + 1 > settings.total;
                    var bb = settings.leaps && page + 1 < settings.total - settings.maxVisible;
                    var cc = vis + settings.maxVisible + step;
                    var dd = page + 1;
                    console.log('-----\n\n page + 1 > settings.total: ' + aa);
                    if (aa) console.log('settings.total: ' + settings.total);
                    if (!aa) console.log('settings.leaps && page + 1 < settings.total - settings.maxVisible: ' + bb);
                    if (bb) console.log('vis + settings.maxVisible + step: ' + cc);
                    if (!bb) console.log('page + 1: ' + dd);
                    console.log('reassign next lp: ' + lp);
                }
                // next
                $page.parent().find('.' + settings.classPrefix + 'next') //.last()
                .toggleClass('disabled', page === settings.total).attr('data-lp', lp).find('a').attr('href', href(lp)).toggle((page !== settings.total && settings.showHideDirections) || !settings.showHideDirections);
                // last
                $page.parent().find('.' + settings.classPrefix + 'last').toggle((page !== settings.total && settings.showHideDirections) || !settings.showHideDirections);
                var $currPage = $page.filter('[data-lp=' + page + ']');
                var class_exceptions = '.' + settings.classPrefix + 'next,.' + settings.classPrefix + 'prev,.' + settings.classPrefix + 'first,.' + settings.classPrefix + 'last';
                if (!$currPage.not(class_exceptions).length) {
                    var d = page <= vis ? -settings.maxVisible : 0;
                    $page.not(class_exceptions).each(function(index) {
                        lp = index + 1 + vis + d;
                        //console.log('reassign lp: ' + lp);
                        $(this).attr('data-lp', lp).toggle(lp <= settings.total).find('a').html(lp).attr('href', href(lp));
                    });
                    $currPage = $page.filter('[data-lp=' + page + ']');
                }
                $currPage.filter('[data-button-type=page]').addClass(activeClass);
                $currPage.addClass('disabled');
                $owner.data('settings', settings);
                
                // check if event should be triggered
                // normally we don't trigger the event on init becuase it may cause a loop
                if ((!settings.skipInitPageEvent && !initPageEvent) || initPageEvent) {
                  var params = {
                    page: page,
                    button: (button) ? button.data('button-type') : 'init'
                  };
                  $owner.trigger('page', params);
                  if (settings.debug) console.log('triggering');
                }
                initPageEvent = true;
            },
            //function href(c){
            href = function(c) {
                return settings.href.replace(settings.hrefVariable, c);
            };
        $owner.init = function() {
            if (settings.debug) console.log('init', settings);
            if ($.isNumeric(settings.itemsPerPage) && $.isNumeric(settings.totalItems)) {
                settings.total = Math.ceil(settings.totalItems / settings.itemsPerPage);
            }
            if (settings.total <= 0) {
                return $owner;
            }
            if (!$.isNumeric(settings.maxVisible) && !settings.maxVisible) {
                settings.maxVisible = settings.total;
            }
            $owner.data('settings', settings);
            $owner.each(function() {
                
                var $bootpag, lp, me = $(this),
                    p = ['<ul class="pagination bootpag">'];
                
                me.find('ul.bootpag').remove();
                
                if (settings.hidePagerForSinglePage && settings.total == 1) {
                  return $owner;
                }
                
                if (settings.first) {
                    p.push('<li data-button-type="first" data-lp="1" class="' + settings.classPrefix + 'first"><a href="' + href(1) + '">' + settings.first + '</a></li>');
                }
                if (settings.prev) {
                    p.push('<li data-button-type="prev" data-lp="1" class="' + settings.classPrefix + 'prev"><a href="' + href(1) + '">' + settings.prev + '</a></li>');
                }
                for (var c = 1; c <= Math.min(settings.total, settings.maxVisible); c++) {
                    p.push('<li data-button-type="page" data-lp="' + c + '" class="' + settings.classPrefix + 'page-' + c + '"><a href="' + href(c) + '">' + c + '</a></li>');
                }
                if (settings.next) {
                    lp = settings.leaps && settings.total > settings.maxVisible ? Math.min(settings.maxVisible + 1, settings.total) : 2;
                    if (settings.debug) console.log('lp: ' + lp);
                    p.push('<li data-button-type="next" data-lp="' + lp + '" class="' + settings.classPrefix + 'next"><a href="' + href(lp) + '">' + settings.next + '</a></li>');
                }
                if (settings.last) {
                    p.push('<li data-button-type="last" data-lp="' + settings.total + '" class="' + settings.classPrefix + 'last"><a href="' + href(settings.total) + '">' + settings.last + '</a></li>');
                }
                //p.push('<li class="last"><a herf="' + href(settings.total) +'">Last</a></li>');
                p.push('</ul>');
                me.append(p.join(''));
                $bootpag = me.find('ul.bootpag');
                me.find('li').click(function paginationClick() {
                    var me = $(this);
                    if (me.hasClass('disabled')) {
                        return;
                    }
                    var page = parseInt(me.attr('data-lp'), 10);
                    renderPage($bootpag, page, me);
                });
                renderPage($bootpag, settings.page, null);
            });
        };
        $owner.init();
        return;
    }
    //})(jQuery, window);
}(jQuery));
