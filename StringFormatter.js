(function(exports) {
	
	// (c) 2007 Steven Levithan <stevenlevithan.com>
	// MIT License matchRecursiveRegExp
	// (c) 2014, 2015 Simon Y. Blackwell <syblackwell@anywhichway.com>
	// MIT License replaceRecursiveRegExp, StringFormatter, DateFormat
	
	// dependencies ... moment.js
	
	/*** matchRecursiveRegExp
		Accepts a string to search, a left and right format delimiter
		as regex patterns, and optional regex flags. Returns an array
		of matches, allowing nested instances of left/right delimiters.
		Use the "g" flag to return all matches, otherwise only the
		first is returned. Be careful to ensure that the left and
		right format delimiters produce mutually exclusive matches.
		Backreferences are not supported within the right delimiter
		due to how it is internally combined with the left delimiter.
		When matching strings whose format delimiters are unbalanced
		to the left or right, the output is intentionally as a
		conventional regex library with recursion support would
		produce, e.g. "<<x>" and "<x>>" both produce ["x"] when using
		"<" and ">" as the delimiters (both strings contain a single,
		balanced instance of "<x>").
	
		examples:
			matchRecursiveRegExp("test", "\\(", "\\)")
				returns: []
			matchRecursiveRegExp("<t<<e>><s>>t<>", "<", ">", "g")
				returns: ["t<<e>><s>", ""]
			matchRecursiveRegExp("<div id=\"x\">test</div>", "<div\\b[^>]*>", "</div>", "gi")
				returns: ["test"]
	
	*/
	function matchRecursiveRegExp (str, left, right, flags) {
		var	f = flags || "",
			g = f.indexOf("g") > -1,
			x = new RegExp(left + "|" + right, (!g ? "g" :"") + f),
			l = new RegExp(left, f.replace(/g/g, "")),
			a = [],
			t, s, m;
	
		do {
			t = 0;
			while (m = x.exec(str)) {
				if (l.test(m[0])) {
					if (!t++) s = x.lastIndex;
				} else if (t) {
					if (!--t) {
						a.push(str.slice(s, m.index));
						if (!g) return a;
					}
				}
			}
		} while (t && (x.lastIndex = s));
	
		return a;
	}
	
	
	function replaceRecursiveRegExp (str, left, right, flags, subst,keepdelim) {
		var	f = flags || "",
			g = f.indexOf("g") > -1,
			x = new RegExp(left + "|" + right, (!g ? "g" :"") + f),
			l = new RegExp(left, f.replace(/g/g, "")),
			a = [],
			result = str.slice(),
			open = (keepdelim ? "" : left.replace("\\","")),
			close = (keepdelim ? "" : right.replace("\\","")),
			t, s, m, r;
	
		do {
			t = 0;
			while (m = x.exec(str)) {
				if (l.test(m[0])) {
					if (!t++) s = x.lastIndex;
				} else if (t) {
					if (!--t) {
						r = str.slice(s, m.index);
						result = result.replace(open+r+close,subst);
						if (!g) return result;
					}
				}
			}
		} while (t && (x.lastIndex = s));
	
		return result;
	}
	
	function DateFormat(spec,date) {
		this.spec = spec;
		this.date = date;
	}
	DateFormat.prototype.format = function() {
		if(!this.spec) {
			return this.date.toString();
		}
		var substitutions = [];
		substitutions.push(this.getMonth());
		substitutions.push(this.getQuarter());
		substitutions.push(this.getYear());
		substitutions.push(this.getDayOfYear());
		substitutions.push(this.getDayOfMonth());
		substitutions.push(this.getDayOfWeek());
		substitutions.push(this.getAMPM());
		substitutions.push(this.getHours());
		substitutions.push(this.getMinutes());
		substitutions.push(this.getSeconds());
		substitutions.push(this.getMilliseconds());
		substitutions.push(this.getTime());
		substitutions.push(this.getTimezoneOffset());
		substitutions.push(this.toUTCString());
		substitutions.push(this.toGMTString());
		substitutions.push(this.toISOString());
		substitutions.push(this.toLocaleString());
		substitutions.push(this.toTimeString());
		var str = ""+this.spec;
		substitutions.forEach(function(substitution) {
			if(substitution) {
				str = str.replace(substitution.pattern,substitution.substitute);
			}
		});
		return str;
	}
	DateFormat.prototype.getMonth = function() {
		var month = this.date.getMonth();
		var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
		if(this.spec.indexOf("MMMM")>=0) {
			return {substitute: months[month], pattern:"MMMM"};
		};
		if(this.spec.indexOf("MMM")>=0) {
			return {substitute:months[month].substring(0,3), pattern:"MMM"};
		};
		if(this.spec.indexOf("MM")>=0) {
			return  {substitute:(month < 9 ? "0" + (month + 1) : ""+ (month + 1)), pattern:"MM"};
		};
		if(this.spec.indexOf("Mo")>=0) {
			switch(month) {
			case 0: return {substitute:"1st", pattern:"Mo"};
			case 1: return {substitute:"2nd", pattern:"Mo"};
			case 2: return {substitute:"3rd", pattern:"Mo"};
			default: return {substitute:(month+1)+"th", pattern:"Mo"};
			}
		};
		if(this.spec.indexOf("M")>=0) {
			return {substitute:"" + (1 + month), pattern:"M"};
		};
		return null;
	}
	DateFormat.prototype.getQuarter = function() {
		var month = this.date.getMonth();
		if(this.spec.indexOf("Q")>=0) {
			if(month<3) {
				return {substitute:"1", pattern:"Q"};
			}
			if(month<6) {
				return {substitute:"2", pattern:"Q"};
			}
			if(month<9) {
				return {substitute:"3", pattern:"Q"};
			}
			return {substitute:"4", pattern:"Q"};
		}
		return null;
	}
	DateFormat.prototype.getYear = function() {
		var year = this.date.getFullYear()+"";
		if(this.spec.indexOf("YYYY")>=0) {
			return {substitute: year, pattern:"YYYY"};
		};
		if(this.spec.indexOf("YY")>=0) {
			return {substitute: year.substring(2), pattern:"YY"};
		};
		return null;
	}
	DateFormat.prototype.getDayOfYear = function() {
		var dt = new Date(this.date);
		dt.setHours(23);
		var d = Math.round((dt - new Date(dt.getFullYear(), 0, 1, 0, 0, 0))/1000/60/60/24);
		if(this.spec.indexOf("DDDD")>=0) {
			return {substitute: (d<10 ? "00"+d : (d<100 ? "0"+d : ""+d)), pattern:"DDDD"};
		};
		if(this.spec.indexOf("DDDo")>=0) {
			d = d+"";
			d = (d.lastIndexOf("1")==d.length+1 ? d+"st" : (d.lastIndexOf("2")===d.length+1 ? d+"nd" : (d.lastIndexOf("3")===d.length+1 ? d+"rd" : d+"th")));
			return {substitute:d , pattern:"DDDo"};
		};
		if(this.spec.indexOf("DDD")>=0) {
			return {substitute: ""+d, pattern:"DDD"};
		};
		return null;
	}
	DateFormat.prototype.getDayOfMonth = function() {
		var date = this.date.getDate();
		if(this.spec.indexOf("DD")>=0) {
			if(date<10) {
				return {substitute:"0"+date, pattern:"DD"}
			}
			return {substitute:""+date, pattern:"DD"};
		};
		if(this.spec.indexOf("Do")>=0) {
			switch(date) {
			case 1: return {substitute:"1st", pattern:"Do"};
			case 2: return {substitute:"2nd", pattern:"Do"};
			case 3: return {substitute:"3rd", pattern:"Do"};
			case 21: return {substitute:"21st", pattern:"Do"};
			case 22: return {substitute:"22nd", pattern:"Do"};
			case 23: return {substitute:"23rd", pattern:"Do"};
			case 31: return {substitute:"31st", pattern:"Do"};
			default: return {substitute:(date)+"th", pattern:"Do"};
			}
		};
		if(this.spec.indexOf("D")>=0) {
			return {substitute:""+date, pattern:"D"};
		};
		return null;
	}
	DateFormat.prototype.getDayOfWeek = function() {
		var day = this.date.getDay();
		var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
		if(this.spec.indexOf("dddd")>=0) {
			return {substitute:days[day], pattern:"dddd"};
		};
		if(this.spec.indexOf("ddd")>=0) {
			return {substitute:days[day].substring(0,3), pattern:"ddd"};
		};
		if(this.spec.indexOf("dd")>=0) {
			return {substitute:days[day].substring(0,2), pattern:"dd"};
		};
		if(this.spec.indexOf("do")>=0) {
			switch(day) {
			case 0: return {substitute:"1st", pattern:"do"};
			case 1: return {substitute:"2nd", pattern:"do"};
			case 2: return {substitute:"3rd", pattern:"do"};
			default: return {substitute:(day+1)+"th", pattern:"do"};
			}
		};
		if(this.spec.indexOf("d")>=0) {
			return {substitute:""+day, pattern:"d"};
		};
		return null;
	}
	DateFormat.prototype.getHours = function() {
		var h = this.date.getHours();
		if(this.spec.indexOf("HH")>=0) {
			return {substitute: (h<10 ? "0"+h : ""+h), pattern:"HH"};
		};
		if(this.spec.indexOf("H")>=0) {
			return {substitute: ""+h, pattern:"H"};
		};
		h = (h==0 ? 12 : h);
		h = (h>12 ? h-12 : h);
		if(this.spec.indexOf("hh")>=0) {
			return {substitute: (h<10 ? "0"+h : ""+h), pattern:"hh"};
		};
		if(this.spec.indexOf("h")>=0) {
			return {substitute: ""+h, pattern:"h"};
		};
		return null;
	}
	DateFormat.prototype.getAMPM = function() {
		var h = this.date.getHours();
		if(this.spec.indexOf("A")>=0) {
			return {substitute: (h>11 ? "PM" : "AM"), pattern:"A"};
		};
		if(this.spec.indexOf("a")>=0) {
			return {substitute: (h>11 ? "pm" : "am"), pattern:"a"};
		};
		return null;
	}
	DateFormat.prototype.getMinutes = function() {
		var minutes = this.date.getMinutes();
		if(this.spec.indexOf("mm")>=0) {
			return {substitute: (minutes<10 ? "0"+minutes : minutes+""), pattern:"mm"};
		};
		if(this.spec.indexOf("m")>=0) {
			return {substitute: minutes+"", pattern:"m"};
		};
		return null;
	}
	DateFormat.prototype.getSeconds = function() {
		var seconds = this.date.getSeconds();
		if(this.spec.indexOf("ss")>=0) {
			return {substitute: (seconds<10 ? "0"+seconds : seconds+""), pattern:"ss"};
		};
		if(this.spec.indexOf("s")>=0) {
			return {substitute: seconds+"", pattern:"s"};
		};
		return null;
	}
	DateFormat.prototype.getMilliseconds = function() {
		var ms = this.date.getMilliseconds()+"";
		if(this.spec.indexOf("SSS")>=0) {
			return {substitute: ms, pattern:"SSS"};
		};
		if(this.spec.indexOf("SS")>=0) {
			return {substitute: ms.substring(0,2), pattern:"SS"};
		};
		if(this.spec.indexOf("S")>=0) {
			return {substitute: ms.substring(0,1), pattern:"S"};
		};
		return null;
	}
	DateFormat.prototype.getTime = function() {
		var t = this.date.getTime()+"";
		if(this.spec.indexOf("X")>=0) {
			return {substitute: t, pattern:"X"};
		};
		return null;
	}
	DateFormat.prototype.getTimezoneOffset = function() {
		var os = this.date.getTimezoneOffset();
		var isneg = (os < 0 ? true : false);
		var ho = Math.abs(os/60);
		var hr = parseInt(ho)+"";
		hr = (hr<10 ? "0"+hr : hr+"");
		hr = (isneg ? "-"+hr : "+"+hr);
		var min = Math.abs(os % 60);
		min = (min<10 ? "0"+min : min+"");
		if(this.spec.indexOf("ZZ")>=0) {
			return {substitute: hr+":"+min, pattern:"ZZ"};
		};
		if(this.spec.indexOf("Z")>=0) {
			return {substitute:  hr+min, pattern:"Z"};
		};
		return null;
	}
	DateFormat.prototype.toUTCString = function() {
		if(this.spec.indexOf("U")>=0) {
			return {substitute: this.date.toUTCString().replace("GMT","UTC"), pattern:"U"};
		};
		return null;
	}
	DateFormat.prototype.toGMTString = function() {
		if(this.spec.indexOf("G")>=0) {
			return {substitute: this.date.toUTCString().replace("UTC","GMT"), pattern:"G"};
		};
		return null;
	}
	DateFormat.prototype.toISOString = function() {
		if(this.spec.indexOf("I")>=0) {
			return {substitute: this.date.toISOString(), pattern:"I"};
		};
		return null;
	}
	DateFormat.prototype.toLocaleString = function() {
		if(this.spec.indexOf("L")>=0) {
			return {substitute: this.date.toLocaleString(), pattern:"L"};
		};
		return null;
	}
	DateFormat.prototype.toTimeString = function() {
		if(this.spec.indexOf("T")>=0) {
			return {substitute: this.date.toTimeString(), pattern:"T"};
		};
		if(this.spec.indexOf("t")>=0) {
			return {substitute: this.date.toLocaleTimeString(), pattern:"t"};
		};
		return null;
	}
	function StringFormatter() {
		var me = this;
		this.cache = {}; // cache for format strings
		this.gcOn = true;
		this.hits = 0; // number of times format has been called
		this.gcThreshold = 1000; // point at which hits results in an attempt to garbage collect
		this.gcPurgeLessThan = 1; // if the use of a string is less than this, then purge from cache during garbage collection
		this.formats = { // storage for functions that actually do the string manipulation for formatting
				string : function(spec,value) {
					var result = value+"";
					var padding = "";
					if(spec.width) {
						 var padlen = spec.width - result.length;
						 if(padlen>0) {
						 	padding = (spec.padding ? spec.padding : "").repeat(padlen);
						 }
					}
					result = padding+result;
					return result;
				},
				number: function(spec,value) {
					var result = parseFloat(value);
					if(result+""=="NaN") {
						return (spec["ifNaN"]!=null ? spec["ifNaN"] : result);
					}
					if(result===Infinity || result===-Infinity) {
						return (spec["ifInfinity"]!=null ? spec["ifInfinity"] : result);
					}
					if(spec.precision!=null) {
						result = result.toPrecision(spec.precision);
					}
					if(spec.fixed!=null) {
						result = parseFloat(result).toFixed(spec.fixed);
					}
					if(spec.as) {
						var as = spec.as[0];
						switch(as) {
							case "%": {
								result = result + "%"; break;
							}
							case "h": {
								result = (result >= 0 ? "0x" : "-0x") + result.toString(16).replace("-",""); break;
							}
							case "o": {
								result = (result >= 0 ? "0" : "-0") + result.toString(8).replace("-",""); break;
							}
							case "b": {
								result = result.toString(2); break;
							}
							case "e": {
								result = result.toExponential(); break;
							}
						}
					}
					var padding = "";
					if(spec.width) {
						 var str = result+"";
						 var padlen = str.length-(spec.sign ? spec.sign.length : 0);
						 if(padlen>0) {
							 padding = (spec.padding ? spec.padding : "0").repeat(padlen);
						 }
					}
					if(spec.sign && parseInt(result)<0) {
						result = (spec.sign instanceof Array ? spec.sign[0] : spec.sign)+padding+result+(spec.sign instanceof Array ? spec.sign[1] : spec.sign);
					} else {
						result = padding+result;
					}
					result = (spec.currency ? spec.currency + result : result);
					result = (spec.accounting && value<0 ? "(" + (result+"").replace("-","") + ")" : result);
					return result;
				},
				boolean: function(spec,value) {
					var result = value;
					switch(spec.as) {
						case "string": {
							result = (value ? "yes" : "no");
							break;
						}
						case "number": {
							result = (value ? 1 : 0);
							break;
						}
						default: {
							result = (value ? true : false);
						}
					}
					var padding = "";
					if(spec.width) {
						 var padlen = spec.padding - result.length;
						 if(padlen>0) {
							 padding = (spec.padding ? spec.padding : "").repeat(padlen);
						 }
					}
					result = padding+result;
					return result;
				},
				Function: function(spec,value) {
				// name, signature
				}
			}
		this.formats.object = this.formats.Object;
		this.formats["function"] = this.formats.Function;
	}
	/* Loop through cache and delete items that have a low utilization */
	StringFormatter.prototype.gc = function() {
		for(var key in this.cache) {
			if(this.cache[key].hits <= this.gcPurgeLessThan) {
				delete this.cache[key];
			}
		}
	}
	/* Register a formatter */
	StringFormatter.prototype.register = function(constructor,formatter,name) {
		name || (name = constructor.name);
		this.formats[name] = (formatter ? formatter : constructor.prototype.StringFormatter);
	}
	/* Patch the global String object so it supports format */
	StringFormatter.prototype.polyfill = function() {
		var me = this;
		String.prototype.format = function() {
			var args = Array.prototype.slice.call(arguments,0);
			args.unshift(this);
			var result = me.format.apply(me,args);
			return result.substring(1,result.length-2);
		}
	}
	StringFormatter.prototype.format = function(formatspec,vargs) {
		var me = this;
		var args = Array.prototype.slice.call(arguments,1);
		// turn format spec into a string, rarely needed unless soemone if building format specs on the fly
		var stringformatter = (formatspec instanceof Object ? JSON.stringify(formatspec) : formatspec);
		// increment overall hit count
		me.hits++;
		if(me.gcOn && me.hits>=me.gcThreshold) {
			me.gc();
		}
		// look for the format spec in the cache
		var formatter = this.cache[stringformatter];
		if(!formatter) { // create a cached spec if not found
			formatter = {patterns:[],statics:[],hits:0};
			// don't cache specs that are dynamic
			if(stringformatter.indexOf("@value")===-1 && stringformatter.indexOf("@arguments")===-1) {
				this.cache[stringformatter] = formatter;
			}
			// "compile" the spec by splitting into static elements and patterns
			var tmp = replaceRecursiveRegExp(stringformatter,"\\{","\\}","g","@!$format$!@"); // replace patterns
			formatter.statics = tmp.split("@!$format$!@"); // get the surrounding text into statics
			formatter.patterns = matchRecursiveRegExp(stringformatter,"\\{","\\}","g"); // collect the patterns
			// process the patterns for dynamic values
			if(formatter.patterns) {
				formatter.patterns.forEach(function(pattern,i) {
					if(pattern.indexOf(":")>=0) {
						pattern = pattern.replace(/@value/g,"$value");
						pattern = pattern.replace(/@argumentse/g,"$arguments");
						formatter.patterns[i] = Function("$value","$arguments","return {" + pattern + "}")(args[i],args);
					} else {
						formatter.patterns[i] = {};
						formatter.patterns[i][pattern] = {};
					}
				});
			}
		}
		// increment the hit count for the specific formatter
		formatter.hits++;
		var results = [];
		var args = arguments;
		// loop through statics
		formatter.statics.forEach(function(str,i) {
			results.push(str); // push them onto the result
			// get the pattern and argument at the same index
			if(i<args.length-1 && i<formatter.patterns.length) {
				var arg = args[i+1];
				var pattern = formatter.patterns[i];
				// figure out what formatter to call and call it
				var type = Object.keys(pattern)[0];
				var spec = pattern[type];
				var value = (typeof(me.formats[type])==="function" ? 
								(arg instanceof Object ? me.formats[type].call(arg,spec,me) : me.formats[type](spec,arg)) : 
								pattern); // if can't resolve, just gets included in output
				if(spec.style) {
					value = "<span style='" + spec.style + "'>" + value + "</span>";
				}
				// push the formatted data onto result
				results.push(value);
			}
		});
		return results.join(""); // create the final string
	}
	function objectFormatter(spec,formatter) {
		function inrange(key) {
			if(spec.include) {
				return spec.include.indexOf(key)>=0;
			}
			if(spec.exclude) {
				return spec.exclude.indexOf(key)===-1;
			}
			return true;
		}
		var result;
		var subspec = {};
		for(var key in spec) {
			if(key!=="width" && key!=="padding") {
				subspec[key] = spec[key];
			}
		}
		if(this instanceof Object) {
			var me = this;
			var keys = Object.keys(this);
			var copy = {};
			keys.forEach(function(key) {
				if(inrange(key)) {
					if(me[key] instanceof Object) {
						if(formatter.formats[me[key].constructor.name]) {
							copy[key] = formatter.formats[me[key].constructor.name].call(me[key],subspec,formatter);
						} else {
							copy[key] = formatter.formats.Object.call(me[key],subspec,formatter);
						}
					} else if(!spec.matchValue || (spec.matchValue.test && spec.matchValue.test(me[key]+""))) {
						copy[key] = formatter.formats[typeof(me[key])](subspec,me[key]);
					}
				}
			});
			result = JSON.stringify(copy);
		}
		var padding = "";
		if(spec.width) {
			 var padlen = spec.padding - result.length;
			 if(padlen>0) {
				 padding = (spec.padding ? spec.padding : "").repeat(padlen);
			 }
		}
		result = padding+result;
		return result;
	}
	function arrayFormatter(spec,formatter) {
		function inrange(index) {
			if(spec.include) {
				if(spec.include.some(function(range) {
					if(index===range || (range instanceof Array && index >= range[0] && index <= range[1])) {
						return true;
					}
					return false;
				})) {
					return true;
				}
				return false;
			}
			if(spec.exclude) {
				if(spec.exclude.some(function(range) {
					if(index===range || (range instanceof Array && index >= range[0] && index <= range[1])) {
						return true;
					}
					return false;
				})) {
					return false;
				}
				return true;
			}
			return true;
		}
		var result;
		var delimiter = (spec.delimiter ? spec.delimiter : ",");
		var container = (spec.container ? spec.container : ["",""]);
		var subspec = {};
		for(var key in spec) {
			if(key!=="width" && key!=="padding") {
				subspec[key] = spec[key];
			}
		}
		if(this instanceof Array) {
			var inscope = [];
			for(var i=0;i<this.length;i++) {
				if(inrange(i)) {
					var element = this[i];
					if(element instanceof Object) {
						if(formatter.formats[element.constructor.name]) {
							inscope.push((spec.quote ? "'" : "") + formatter.formats[element.constructor.name].call(element,subspec,formatter) + (spec.quote ? "'" : ""));
						} else {
							inscope.push((spec.quote ? "'" : "") + formatter.formats.Object.call(element,subspec,formatter) + (spec.quote ? "'" : ""));
						}
					} else if(!spec.matchValue || (spec.matchValue.test && spec.matchValue.test(element+""))) {
						inscope.push((spec.quote ? "'" : "") + formatter.formats[typeof(element)](subspec,element) + (spec.quote ? "'" : ""));
					}
				}
			}
			result = container[0] + inscope.join(delimiter) + container[1];
		}
		var padding = "";
		if(spec.width) {
			 var padlen = spec.padding - result.length;
			 if(padlen>0) {
				 padding = (spec.padding ? spec.padding : "").repeat(padlen);
			 }
		}
		result = padding+result;
		return result;
	}
	function  dateFormatter(spec) {
		var dateformat = new DateFormat(spec.format,this);
		return dateformat.format();
	}

	exports.StringFormatter = new StringFormatter();
	exports.StringFormatter.register(Array,arrayFormatter,"Array");
	exports.StringFormatter.register(Object,objectFormatter,"Object");
	exports.StringFormatter.register(Object,objectFormatter,"object");
	exports.StringFormatter.register(Date,dateFormatter,"Date");
})("undefined"!=typeof exports&&"undefined"!=typeof global?global:window);