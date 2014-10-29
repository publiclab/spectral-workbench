require 'test_helper'

class ExceptionsTest < ActionController::IntegrationTest
  fixtures :all

  # Replace this with your real tests.
  test "the truth" do
    assert true
  end

  #test "POST /products" do
  #  post "/products", "commit"=>"Submit", "product"=>{"name"=>"Headphones", "price"=>"-2"}
  #  assert_response :success
  #end
  
  test "GET /sets" do
    #product = Product.first
    #get "/products/#{product.id}/edit"
    get "/sets"
    assert_response :success
  end

  test "GET /popular" do
    get "/popular"
    assert_response :success
  end

  test "GET /" do
    get "/"
    assert_response :success
  end

  test "GET /analyze/spectrum/#" do
    spectrum = Spectrum.find :first
    get "/analyze/spectrum/#{spectrum.id}"
    assert_response :success
  end

  test "GET /sets/show/#" do
    set = SpectraSet.find :first
    get "/sets/show/#{set.id}"
    assert_response :success
  end

  test "GET /tags" do
    get "/tags"
    assert_response :success
  end

  test "GET /profile/#" do
    get "/local/tester"
    assert_response :redirect
    assert_redirected_to "/"
#    get "/dashboard"
#    assert_tag (:content => /Recent sets/)
#    assert_template "users/dashboard"
  end
end
