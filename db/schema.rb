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
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2018_08_28_165819) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "blockchains", force: :cascade do |t|
    t.bigint "weeet_id"
    t.integer "command", null: false
    t.boolean "executed", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_successful", default: false, null: false
    t.index ["weeet_id", "command"], name: "index_blockchains_on_weeet_id_and_command"
    t.index ["weeet_id"], name: "index_blockchains_on_weeet_id"
  end

  create_table "configs", force: :cascade do |t|
    t.string "key", null: false
    t.string "property", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.datetime "remember_created_at"
    t.string "name", null: false
    t.integer "karma", default: 100, null: false
    t.integer "winning_streak", default: 0, null: false
    t.datetime "karma_fill_time"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "role", default: 0, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["name"], name: "index_users_on_name", unique: true
  end

  create_table "votes", force: :cascade do |t|
    t.bigint "user_id"
    t.bigint "weeet_id"
    t.boolean "voteup", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "weeet_id"], name: "index_votes_on_user_id_and_weeet_id", unique: true
    t.index ["user_id"], name: "index_votes_on_user_id"
    t.index ["weeet_id"], name: "index_votes_on_weeet_id"
  end

  create_table "weeets", force: :cascade do |t|
    t.bigint "user_id"
    t.string "content", null: false
    t.boolean "is_published", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_evaluated", default: false, null: false
    t.datetime "evaluate_at", null: false
    t.boolean "persisted_on_blockchain", default: false, null: false
    t.index ["user_id"], name: "index_weeets_on_user_id"
  end

end
