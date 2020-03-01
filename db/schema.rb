# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20190513143943) do

  create_table "comments", :force => true do |t|
    t.string   "author"
    t.string   "email"
    t.text     "body"
    t.integer  "x"
    t.integer  "y"
    t.integer  "spectrum_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "spectra_set_id", :default => 0
    t.integer  "user_id",        :default => 0
    t.integer  "wavelength"
    t.integer  "intensity"
  end

  create_table "devices", :force => true do |t|
    t.string   "name"
    t.string   "description",    :limit => 100,                                :default => "", :null => false
    t.integer  "height"
    t.integer  "width"
    t.integer  "calibration_id"
    t.integer  "user_id"
    t.decimal  "range_start",                   :precision => 10, :scale => 0
    t.decimal  "range_end",                     :precision => 10, :scale => 0
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "key",                                                          :default => "", :null => false
  end

  create_table "likes", :force => true do |t|
    t.integer  "spectrum_id"
    t.string   "like_type",   :default => "like", :null => false
    t.integer  "user_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "macros", :force => true do |t|
    t.integer  "user_id"
    t.string   "macro_type",  :default => "analyze",   :null => false
    t.string   "title"
    t.string   "url"
    t.text     "description"
    t.text     "code"
    t.string   "published",   :default => "published"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "processed_spectrums", :force => true do |t|
    t.integer "spectrum_id"
    t.integer "a10",         :default => 0
    t.integer "r10",         :default => 0
    t.integer "g10",         :default => 0
    t.integer "b10",         :default => 0
    t.integer "a20",         :default => 0
    t.integer "r20",         :default => 0
    t.integer "g20",         :default => 0
    t.integer "b20",         :default => 0
    t.integer "a30",         :default => 0
    t.integer "r30",         :default => 0
    t.integer "g30",         :default => 0
    t.integer "b30",         :default => 0
    t.integer "a40",         :default => 0
    t.integer "r40",         :default => 0
    t.integer "g40",         :default => 0
    t.integer "b40",         :default => 0
    t.integer "a50",         :default => 0
    t.integer "r50",         :default => 0
    t.integer "g50",         :default => 0
    t.integer "b50",         :default => 0
    t.integer "a60",         :default => 0
    t.integer "r60",         :default => 0
    t.integer "g60",         :default => 0
    t.integer "b60",         :default => 0
    t.integer "a70",         :default => 0
    t.integer "r70",         :default => 0
    t.integer "g70",         :default => 0
    t.integer "b70",         :default => 0
    t.integer "a80",         :default => 0
    t.integer "r80",         :default => 0
    t.integer "g80",         :default => 0
    t.integer "b80",         :default => 0
    t.integer "a90",         :default => 0
    t.integer "r90",         :default => 0
    t.integer "g90",         :default => 0
    t.integer "b90",         :default => 0
    t.integer "a100",        :default => 0
    t.integer "r100",        :default => 0
    t.integer "g100",        :default => 0
    t.integer "b100",        :default => 0
    t.integer "a110",        :default => 0
    t.integer "r110",        :default => 0
    t.integer "g110",        :default => 0
    t.integer "b110",        :default => 0
    t.integer "a120",        :default => 0
    t.integer "r120",        :default => 0
    t.integer "g120",        :default => 0
    t.integer "b120",        :default => 0
    t.integer "a130",        :default => 0
    t.integer "r130",        :default => 0
    t.integer "g130",        :default => 0
    t.integer "b130",        :default => 0
    t.integer "a140",        :default => 0
    t.integer "r140",        :default => 0
    t.integer "g140",        :default => 0
    t.integer "b140",        :default => 0
    t.integer "a150",        :default => 0
    t.integer "r150",        :default => 0
    t.integer "g150",        :default => 0
    t.integer "b150",        :default => 0
    t.integer "a160",        :default => 0
    t.integer "r160",        :default => 0
    t.integer "g160",        :default => 0
    t.integer "b160",        :default => 0
    t.integer "a170",        :default => 0
    t.integer "r170",        :default => 0
    t.integer "g170",        :default => 0
    t.integer "b170",        :default => 0
    t.integer "a180",        :default => 0
    t.integer "r180",        :default => 0
    t.integer "g180",        :default => 0
    t.integer "b180",        :default => 0
    t.integer "a190",        :default => 0
    t.integer "r190",        :default => 0
    t.integer "g190",        :default => 0
    t.integer "b190",        :default => 0
    t.integer "a200",        :default => 0
    t.integer "r200",        :default => 0
    t.integer "g200",        :default => 0
    t.integer "b200",        :default => 0
    t.integer "a210",        :default => 0
    t.integer "r210",        :default => 0
    t.integer "g210",        :default => 0
    t.integer "b210",        :default => 0
    t.integer "a220",        :default => 0
    t.integer "r220",        :default => 0
    t.integer "g220",        :default => 0
    t.integer "b220",        :default => 0
    t.integer "a230",        :default => 0
    t.integer "r230",        :default => 0
    t.integer "g230",        :default => 0
    t.integer "b230",        :default => 0
    t.integer "a240",        :default => 0
    t.integer "r240",        :default => 0
    t.integer "g240",        :default => 0
    t.integer "b240",        :default => 0
    t.integer "a250",        :default => 0
    t.integer "r250",        :default => 0
    t.integer "g250",        :default => 0
    t.integer "b250",        :default => 0
    t.integer "a260",        :default => 0
    t.integer "r260",        :default => 0
    t.integer "g260",        :default => 0
    t.integer "b260",        :default => 0
    t.integer "a270",        :default => 0
    t.integer "r270",        :default => 0
    t.integer "g270",        :default => 0
    t.integer "b270",        :default => 0
    t.integer "a280",        :default => 0
    t.integer "r280",        :default => 0
    t.integer "g280",        :default => 0
    t.integer "b280",        :default => 0
    t.integer "a290",        :default => 0
    t.integer "r290",        :default => 0
    t.integer "g290",        :default => 0
    t.integer "b290",        :default => 0
    t.integer "a300",        :default => 0
    t.integer "r300",        :default => 0
    t.integer "g300",        :default => 0
    t.integer "b300",        :default => 0
    t.integer "a310",        :default => 0
    t.integer "r310",        :default => 0
    t.integer "g310",        :default => 0
    t.integer "b310",        :default => 0
    t.integer "a320",        :default => 0
    t.integer "r320",        :default => 0
    t.integer "g320",        :default => 0
    t.integer "b320",        :default => 0
    t.integer "a330",        :default => 0
    t.integer "r330",        :default => 0
    t.integer "g330",        :default => 0
    t.integer "b330",        :default => 0
    t.integer "a340",        :default => 0
    t.integer "r340",        :default => 0
    t.integer "g340",        :default => 0
    t.integer "b340",        :default => 0
    t.integer "a350",        :default => 0
    t.integer "r350",        :default => 0
    t.integer "g350",        :default => 0
    t.integer "b350",        :default => 0
    t.integer "a360",        :default => 0
    t.integer "r360",        :default => 0
    t.integer "g360",        :default => 0
    t.integer "b360",        :default => 0
    t.integer "a370",        :default => 0
    t.integer "r370",        :default => 0
    t.integer "g370",        :default => 0
    t.integer "b370",        :default => 0
    t.integer "a380",        :default => 0
    t.integer "r380",        :default => 0
    t.integer "g380",        :default => 0
    t.integer "b380",        :default => 0
    t.integer "a390",        :default => 0
    t.integer "r390",        :default => 0
    t.integer "g390",        :default => 0
    t.integer "b390",        :default => 0
    t.integer "a400",        :default => 0
    t.integer "r400",        :default => 0
    t.integer "g400",        :default => 0
    t.integer "b400",        :default => 0
    t.integer "a410",        :default => 0
    t.integer "r410",        :default => 0
    t.integer "g410",        :default => 0
    t.integer "b410",        :default => 0
    t.integer "a420",        :default => 0
    t.integer "r420",        :default => 0
    t.integer "g420",        :default => 0
    t.integer "b420",        :default => 0
    t.integer "a430",        :default => 0
    t.integer "r430",        :default => 0
    t.integer "g430",        :default => 0
    t.integer "b430",        :default => 0
    t.integer "a440",        :default => 0
    t.integer "r440",        :default => 0
    t.integer "g440",        :default => 0
    t.integer "b440",        :default => 0
    t.integer "a450",        :default => 0
    t.integer "r450",        :default => 0
    t.integer "g450",        :default => 0
    t.integer "b450",        :default => 0
    t.integer "a460",        :default => 0
    t.integer "r460",        :default => 0
    t.integer "g460",        :default => 0
    t.integer "b460",        :default => 0
    t.integer "a470",        :default => 0
    t.integer "r470",        :default => 0
    t.integer "g470",        :default => 0
    t.integer "b470",        :default => 0
    t.integer "a480",        :default => 0
    t.integer "r480",        :default => 0
    t.integer "g480",        :default => 0
    t.integer "b480",        :default => 0
    t.integer "a490",        :default => 0
    t.integer "r490",        :default => 0
    t.integer "g490",        :default => 0
    t.integer "b490",        :default => 0
    t.integer "a500",        :default => 0
    t.integer "r500",        :default => 0
    t.integer "g500",        :default => 0
    t.integer "b500",        :default => 0
    t.integer "a510",        :default => 0
    t.integer "r510",        :default => 0
    t.integer "g510",        :default => 0
    t.integer "b510",        :default => 0
    t.integer "a520",        :default => 0
    t.integer "r520",        :default => 0
    t.integer "g520",        :default => 0
    t.integer "b520",        :default => 0
    t.integer "a530",        :default => 0
    t.integer "r530",        :default => 0
    t.integer "g530",        :default => 0
    t.integer "b530",        :default => 0
    t.integer "a540",        :default => 0
    t.integer "r540",        :default => 0
    t.integer "g540",        :default => 0
    t.integer "b540",        :default => 0
    t.integer "a550",        :default => 0
    t.integer "r550",        :default => 0
    t.integer "g550",        :default => 0
    t.integer "b550",        :default => 0
    t.integer "a560",        :default => 0
    t.integer "r560",        :default => 0
    t.integer "g560",        :default => 0
    t.integer "b560",        :default => 0
    t.integer "a570",        :default => 0
    t.integer "r570",        :default => 0
    t.integer "g570",        :default => 0
    t.integer "b570",        :default => 0
    t.integer "a580",        :default => 0
    t.integer "r580",        :default => 0
    t.integer "g580",        :default => 0
    t.integer "b580",        :default => 0
    t.integer "a590",        :default => 0
    t.integer "r590",        :default => 0
    t.integer "g590",        :default => 0
    t.integer "b590",        :default => 0
    t.integer "a600",        :default => 0
    t.integer "r600",        :default => 0
    t.integer "g600",        :default => 0
    t.integer "b600",        :default => 0
    t.integer "a610",        :default => 0
    t.integer "r610",        :default => 0
    t.integer "g610",        :default => 0
    t.integer "b610",        :default => 0
    t.integer "a620",        :default => 0
    t.integer "r620",        :default => 0
    t.integer "g620",        :default => 0
    t.integer "b620",        :default => 0
    t.integer "a630",        :default => 0
    t.integer "r630",        :default => 0
    t.integer "g630",        :default => 0
    t.integer "b630",        :default => 0
    t.integer "a640",        :default => 0
    t.integer "r640",        :default => 0
    t.integer "g640",        :default => 0
    t.integer "b640",        :default => 0
    t.integer "a650",        :default => 0
    t.integer "r650",        :default => 0
    t.integer "g650",        :default => 0
    t.integer "b650",        :default => 0
    t.integer "a660",        :default => 0
    t.integer "r660",        :default => 0
    t.integer "g660",        :default => 0
    t.integer "b660",        :default => 0
    t.integer "a670",        :default => 0
    t.integer "r670",        :default => 0
    t.integer "g670",        :default => 0
    t.integer "b670",        :default => 0
    t.integer "a680",        :default => 0
    t.integer "r680",        :default => 0
    t.integer "g680",        :default => 0
    t.integer "b680",        :default => 0
    t.integer "a690",        :default => 0
    t.integer "r690",        :default => 0
    t.integer "g690",        :default => 0
    t.integer "b690",        :default => 0
    t.integer "a700",        :default => 0
    t.integer "r700",        :default => 0
    t.integer "g700",        :default => 0
    t.integer "b700",        :default => 0
    t.integer "a710",        :default => 0
    t.integer "r710",        :default => 0
    t.integer "g710",        :default => 0
    t.integer "b710",        :default => 0
    t.integer "a720",        :default => 0
    t.integer "r720",        :default => 0
    t.integer "g720",        :default => 0
    t.integer "b720",        :default => 0
    t.integer "a730",        :default => 0
    t.integer "r730",        :default => 0
    t.integer "g730",        :default => 0
    t.integer "b730",        :default => 0
    t.integer "a740",        :default => 0
    t.integer "r740",        :default => 0
    t.integer "g740",        :default => 0
    t.integer "b740",        :default => 0
    t.integer "a750",        :default => 0
    t.integer "r750",        :default => 0
    t.integer "g750",        :default => 0
    t.integer "b750",        :default => 0
    t.integer "a760",        :default => 0
    t.integer "r760",        :default => 0
    t.integer "g760",        :default => 0
    t.integer "b760",        :default => 0
    t.integer "a770",        :default => 0
    t.integer "r770",        :default => 0
    t.integer "g770",        :default => 0
    t.integer "b770",        :default => 0
    t.integer "a780",        :default => 0
    t.integer "r780",        :default => 0
    t.integer "g780",        :default => 0
    t.integer "b780",        :default => 0
    t.integer "a790",        :default => 0
    t.integer "r790",        :default => 0
    t.integer "g790",        :default => 0
    t.integer "b790",        :default => 0
    t.integer "a800",        :default => 0
    t.integer "r800",        :default => 0
    t.integer "g800",        :default => 0
    t.integer "b800",        :default => 0
    t.integer "a810",        :default => 0
    t.integer "r810",        :default => 0
    t.integer "g810",        :default => 0
    t.integer "b810",        :default => 0
    t.integer "a820",        :default => 0
    t.integer "r820",        :default => 0
    t.integer "g820",        :default => 0
    t.integer "b820",        :default => 0
    t.integer "a830",        :default => 0
    t.integer "r830",        :default => 0
    t.integer "g830",        :default => 0
    t.integer "b830",        :default => 0
    t.integer "a840",        :default => 0
    t.integer "r840",        :default => 0
    t.integer "g840",        :default => 0
    t.integer "b840",        :default => 0
    t.integer "a850",        :default => 0
    t.integer "r850",        :default => 0
    t.integer "g850",        :default => 0
    t.integer "b850",        :default => 0
    t.integer "a860",        :default => 0
    t.integer "r860",        :default => 0
    t.integer "g860",        :default => 0
    t.integer "b860",        :default => 0
    t.integer "a870",        :default => 0
    t.integer "r870",        :default => 0
    t.integer "g870",        :default => 0
    t.integer "b870",        :default => 0
    t.integer "a880",        :default => 0
    t.integer "r880",        :default => 0
    t.integer "g880",        :default => 0
    t.integer "b880",        :default => 0
    t.integer "a890",        :default => 0
    t.integer "r890",        :default => 0
    t.integer "g890",        :default => 0
    t.integer "b890",        :default => 0
    t.integer "a900",        :default => 0
    t.integer "r900",        :default => 0
    t.integer "g900",        :default => 0
    t.integer "b900",        :default => 0
    t.integer "a910",        :default => 0
    t.integer "r910",        :default => 0
    t.integer "g910",        :default => 0
    t.integer "b910",        :default => 0
    t.integer "a920",        :default => 0
    t.integer "r920",        :default => 0
    t.integer "g920",        :default => 0
    t.integer "b920",        :default => 0
    t.integer "a930",        :default => 0
    t.integer "r930",        :default => 0
    t.integer "g930",        :default => 0
    t.integer "b930",        :default => 0
    t.integer "a940",        :default => 0
    t.integer "r940",        :default => 0
    t.integer "g940",        :default => 0
    t.integer "b940",        :default => 0
    t.integer "a950",        :default => 0
    t.integer "r950",        :default => 0
    t.integer "g950",        :default => 0
    t.integer "b950",        :default => 0
    t.integer "a960",        :default => 0
    t.integer "r960",        :default => 0
    t.integer "g960",        :default => 0
    t.integer "b960",        :default => 0
    t.integer "a970",        :default => 0
    t.integer "r970",        :default => 0
    t.integer "g970",        :default => 0
    t.integer "b970",        :default => 0
    t.integer "a980",        :default => 0
    t.integer "r980",        :default => 0
    t.integer "g980",        :default => 0
    t.integer "b980",        :default => 0
    t.integer "a990",        :default => 0
    t.integer "r990",        :default => 0
    t.integer "g990",        :default => 0
    t.integer "b990",        :default => 0
    t.integer "a1000",       :default => 0
    t.integer "r1000",       :default => 0
    t.integer "g1000",       :default => 0
    t.integer "b1000",       :default => 0
    t.integer "a1010",       :default => 0
    t.integer "r1010",       :default => 0
    t.integer "g1010",       :default => 0
    t.integer "b1010",       :default => 0
    t.integer "a1020",       :default => 0
    t.integer "r1020",       :default => 0
    t.integer "g1020",       :default => 0
    t.integer "b1020",       :default => 0
    t.integer "a1030",       :default => 0
    t.integer "r1030",       :default => 0
    t.integer "g1030",       :default => 0
    t.integer "b1030",       :default => 0
    t.integer "a1040",       :default => 0
    t.integer "r1040",       :default => 0
    t.integer "g1040",       :default => 0
    t.integer "b1040",       :default => 0
    t.integer "a1050",       :default => 0
    t.integer "r1050",       :default => 0
    t.integer "g1050",       :default => 0
    t.integer "b1050",       :default => 0
    t.integer "a1060",       :default => 0
    t.integer "r1060",       :default => 0
    t.integer "g1060",       :default => 0
    t.integer "b1060",       :default => 0
    t.integer "a1070",       :default => 0
    t.integer "r1070",       :default => 0
    t.integer "g1070",       :default => 0
    t.integer "b1070",       :default => 0
    t.integer "a1080",       :default => 0
    t.integer "r1080",       :default => 0
    t.integer "g1080",       :default => 0
    t.integer "b1080",       :default => 0
    t.integer "a1090",       :default => 0
    t.integer "r1090",       :default => 0
    t.integer "g1090",       :default => 0
    t.integer "b1090",       :default => 0
    t.integer "a1100",       :default => 0
    t.integer "r1100",       :default => 0
    t.integer "g1100",       :default => 0
    t.integer "b1100",       :default => 0
    t.integer "a1110",       :default => 0
    t.integer "r1110",       :default => 0
    t.integer "g1110",       :default => 0
    t.integer "b1110",       :default => 0
    t.integer "a1120",       :default => 0
    t.integer "r1120",       :default => 0
    t.integer "g1120",       :default => 0
    t.integer "b1120",       :default => 0
    t.integer "a1130",       :default => 0
    t.integer "r1130",       :default => 0
    t.integer "g1130",       :default => 0
    t.integer "b1130",       :default => 0
    t.integer "a1140",       :default => 0
    t.integer "r1140",       :default => 0
    t.integer "g1140",       :default => 0
    t.integer "b1140",       :default => 0
    t.integer "a1150",       :default => 0
    t.integer "r1150",       :default => 0
    t.integer "g1150",       :default => 0
    t.integer "b1150",       :default => 0
    t.integer "a1160",       :default => 0
    t.integer "r1160",       :default => 0
    t.integer "g1160",       :default => 0
    t.integer "b1160",       :default => 0
    t.integer "a1170",       :default => 0
    t.integer "r1170",       :default => 0
    t.integer "g1170",       :default => 0
    t.integer "b1170",       :default => 0
    t.integer "a1180",       :default => 0
    t.integer "r1180",       :default => 0
    t.integer "g1180",       :default => 0
    t.integer "b1180",       :default => 0
    t.integer "a1190",       :default => 0
    t.integer "r1190",       :default => 0
    t.integer "g1190",       :default => 0
    t.integer "b1190",       :default => 0
    t.integer "a1200",       :default => 0
    t.integer "r1200",       :default => 0
    t.integer "g1200",       :default => 0
    t.integer "b1200",       :default => 0
    t.integer "a1210",       :default => 0
    t.integer "r1210",       :default => 0
    t.integer "g1210",       :default => 0
    t.integer "b1210",       :default => 0
    t.integer "a1220",       :default => 0
    t.integer "r1220",       :default => 0
    t.integer "g1220",       :default => 0
    t.integer "b1220",       :default => 0
    t.integer "a1230",       :default => 0
    t.integer "r1230",       :default => 0
    t.integer "g1230",       :default => 0
    t.integer "b1230",       :default => 0
    t.integer "a1240",       :default => 0
    t.integer "r1240",       :default => 0
    t.integer "g1240",       :default => 0
    t.integer "b1240",       :default => 0
    t.integer "a1250",       :default => 0
    t.integer "r1250",       :default => 0
    t.integer "g1250",       :default => 0
    t.integer "b1250",       :default => 0
    t.integer "a1260",       :default => 0
    t.integer "r1260",       :default => 0
    t.integer "g1260",       :default => 0
    t.integer "b1260",       :default => 0
    t.integer "a1270",       :default => 0
    t.integer "r1270",       :default => 0
    t.integer "g1270",       :default => 0
    t.integer "b1270",       :default => 0
    t.integer "a1280",       :default => 0
    t.integer "r1280",       :default => 0
    t.integer "g1280",       :default => 0
    t.integer "b1280",       :default => 0
    t.integer "a1290",       :default => 0
    t.integer "r1290",       :default => 0
    t.integer "g1290",       :default => 0
    t.integer "b1290",       :default => 0
    t.integer "a1300",       :default => 0
    t.integer "r1300",       :default => 0
    t.integer "g1300",       :default => 0
    t.integer "b1300",       :default => 0
    t.integer "a1310",       :default => 0
    t.integer "r1310",       :default => 0
    t.integer "g1310",       :default => 0
    t.integer "b1310",       :default => 0
    t.integer "a1320",       :default => 0
    t.integer "r1320",       :default => 0
    t.integer "g1320",       :default => 0
    t.integer "b1320",       :default => 0
    t.integer "a1330",       :default => 0
    t.integer "r1330",       :default => 0
    t.integer "g1330",       :default => 0
    t.integer "b1330",       :default => 0
    t.integer "a1340",       :default => 0
    t.integer "r1340",       :default => 0
    t.integer "g1340",       :default => 0
    t.integer "b1340",       :default => 0
    t.integer "a1350",       :default => 0
    t.integer "r1350",       :default => 0
    t.integer "g1350",       :default => 0
    t.integer "b1350",       :default => 0
    t.integer "a1360",       :default => 0
    t.integer "r1360",       :default => 0
    t.integer "g1360",       :default => 0
    t.integer "b1360",       :default => 0
    t.integer "a1370",       :default => 0
    t.integer "r1370",       :default => 0
    t.integer "g1370",       :default => 0
    t.integer "b1370",       :default => 0
    t.integer "a1380",       :default => 0
    t.integer "r1380",       :default => 0
    t.integer "g1380",       :default => 0
    t.integer "b1380",       :default => 0
    t.integer "a1390",       :default => 0
    t.integer "r1390",       :default => 0
    t.integer "g1390",       :default => 0
    t.integer "b1390",       :default => 0
    t.integer "a1400",       :default => 0
    t.integer "r1400",       :default => 0
    t.integer "g1400",       :default => 0
    t.integer "b1400",       :default => 0
    t.integer "a1410",       :default => 0
    t.integer "r1410",       :default => 0
    t.integer "g1410",       :default => 0
    t.integer "b1410",       :default => 0
    t.integer "a1420",       :default => 0
    t.integer "r1420",       :default => 0
    t.integer "g1420",       :default => 0
    t.integer "b1420",       :default => 0
    t.integer "a1430",       :default => 0
    t.integer "r1430",       :default => 0
    t.integer "g1430",       :default => 0
    t.integer "b1430",       :default => 0
    t.integer "a1440",       :default => 0
    t.integer "r1440",       :default => 0
    t.integer "g1440",       :default => 0
    t.integer "b1440",       :default => 0
    t.integer "a1450",       :default => 0
    t.integer "r1450",       :default => 0
    t.integer "g1450",       :default => 0
    t.integer "b1450",       :default => 0
    t.integer "a1460",       :default => 0
    t.integer "r1460",       :default => 0
    t.integer "g1460",       :default => 0
    t.integer "b1460",       :default => 0
    t.integer "a1470",       :default => 0
    t.integer "r1470",       :default => 0
    t.integer "g1470",       :default => 0
    t.integer "b1470",       :default => 0
    t.integer "a1480",       :default => 0
    t.integer "r1480",       :default => 0
    t.integer "g1480",       :default => 0
    t.integer "b1480",       :default => 0
    t.integer "a1490",       :default => 0
    t.integer "r1490",       :default => 0
    t.integer "g1490",       :default => 0
    t.integer "b1490",       :default => 0
  end

  add_index "processed_spectrums", ["spectrum_id"], :name => "index_processed_spectrums_on_spectrum_id", :unique => true

  create_table "snapshots", :force => true do |t|
    t.integer  "user_id"
    t.integer  "spectrum_id"
    t.integer  "tag_id"
    t.text     "description"
    t.text     "data"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "snapshots", ["spectrum_id"], :name => "index_snapshots_on_spectrum_id"
  add_index "snapshots", ["tag_id"], :name => "index_snapshots_on_tag_id"

  create_table "spectra_sets", :force => true do |t|
    t.string   "title",      :default => "", :null => false
    t.string   "author",     :default => "", :null => false
    t.datetime "created_at"
    t.datetime "updated_at"
    t.text     "notes",                      :null => false
    t.integer  "user_id",    :default => 0
  end

  create_table "spectra_sets_spectrums", :id => false, :force => true do |t|
    t.integer "spectrum_id"
    t.integer "spectra_set_id"
  end

  add_index "spectra_sets_spectrums", ["spectra_set_id"], :name => "index_spectra_sets_spectrums_on_spectra_set_id"
  add_index "spectra_sets_spectrums", ["spectrum_id"], :name => "index_spectra_sets_spectrums_on_spectrum_id"

  create_table "spectrums", :force => true do |t|
    t.string   "title"
    t.string   "author"
    t.string   "set"
    t.text     "data",                  :limit => 2147483647
    t.text     "notes"
    t.integer  "version"
    t.integer  "parent_id"
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.string   "photo_file_size"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "photo_position",                                                             :default => "false"
    t.string   "baseline_position",                                                          :default => "false"
    t.string   "baseline_file_name"
    t.string   "baseline_content_type"
    t.string   "baseline_file_size"
    t.string   "control_points"
    t.string   "slice_data_url"
    t.string   "client_code",                                                                :default => "",      :null => false
    t.integer  "user_id",                                                                    :default => 0,       :null => false
    t.decimal  "lat",                                         :precision => 10, :scale => 0, :default => 0,       :null => false
    t.decimal  "lon",                                         :precision => 10, :scale => 0, :default => 0,       :null => false
    t.integer  "sample_row",                                                                 :default => 1,       :null => false
    t.integer  "like_count",                                                                 :default => 0,       :null => false
    t.integer  "video_row",                                                                  :default => 0
    t.boolean  "reversed",                                                                   :default => false,   :null => false
    t.boolean  "calibrated",                                                                 :default => false,   :null => false
  end

  add_index "spectrums", ["author"], :name => "index_spectrums_on_author"
  add_index "spectrums", ["created_at"], :name => "index_spectrums_on_created_at"
  add_index "spectrums", ["like_count"], :name => "index_spectrums_on_like_count"
  add_index "spectrums", ["title"], :name => "index_spectrums_on_title"
  add_index "spectrums", ["user_id"], :name => "index_spectrums_on_user_id"

  create_table "tags", :force => true do |t|
    t.integer  "user_id"
    t.string   "name"
    t.integer  "spectrum_id"
    t.integer  "set_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "tags", ["name"], :name => "index_tags_on_name"
  add_index "tags", ["spectrum_id"], :name => "index_tags_on_spectrum_id"

  create_table "users", :force => true do |t|
    t.string   "login",                     :limit => 40
    t.string   "name",                      :limit => 100, :default => ""
    t.string   "email",                     :limit => 100
    t.string   "crypted_password",          :limit => 40
    t.string   "salt",                      :limit => 40
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "remember_token",            :limit => 40
    t.datetime "remember_token_expires_at"
    t.string   "identity_url"
    t.string   "role",                                     :default => "basic", :null => false
    t.string   "email_preferences",                        :default => "1",     :null => false
  end

  add_index "users", ["login"], :name => "index_users_on_login", :unique => true

  create_table "videos", :force => true do |t|
    t.string   "title"
    t.string   "author"
    t.string   "set"
    t.string   "scan_type"
    t.text     "data"
    t.text     "notes"
    t.integer  "version"
    t.integer  "start_frame"
    t.integer  "end_frame"
    t.integer  "parent_id"
    t.string   "video_file_name"
    t.string   "video_content_type"
    t.string   "video_file_size"
    t.datetime "video_updated_at"
    t.string   "video_position"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

end
