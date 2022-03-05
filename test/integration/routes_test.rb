# frozen_string_literal: true

require 'test_helper'

class RoutesTest < ActionDispatch::IntegrationTest
  fixtures :all
  
  test "test get request for sets embed" do
    assert_routing({ path: '/sets/embed/:id', method: 'get' }, {controller: 'sets', action: 'embed', id: ':id' })
  end
  
  test "test get request for spectrums embed2" do
    assert_routing({ path: '/spectrums/embed2/:id', method: 'get' }, {controller: 'spectrums', action: 'embed2', id: ':id' })
  end  

  test "test get request for sets create" do
    assert_routing({ path: '/sets/create/:id', method: 'post' }, {controller: 'sets', action: 'create', id: ':id' })
  end
  
  test "test get request for sets embed2" do
    assert_routing({ path: '/sets/embed2/:id', method: 'get' }, {controller: 'sets', action: 'embed2', id: ':id' })
  end

  test "test spectrums choose route" do
    assert_routing({ path: '/spectrums/choose', method: :post }, { controller: 'spectrums', action: 'choose' })
  end

  test "test get request for spectrums destroy id" do
    assert_routing({ path: '/spectrums/destroy/:id', method: 'get' }, {controller: 'spectrums', action: 'destroy', id: ':id' })
  end

  test "test get request for spectrums latest" do
    assert_routing({ path: '/spectrums/latest/:id', method: 'get' }, {controller: 'spectrums', action: 'latest', id: ':id' })
  end
  
  test "test post request for spectrums update id" do
    assert_routing({ path: '/spectrums/:id/update', method: 'post' }, {controller: 'spectrums', action: 'update', id: ':id' })
  end
  
  test "test post request for spectrums fork" do
    assert_routing({ path: '/spectrums/fork/:id', method: 'post' }, {controller: 'spectrums', action: 'fork', id: ':id' })
  end
  
  test "test get request for spectrums embed" do
    assert_routing({ path: '/spectrums/embed/:id', method: 'get' }, {controller: 'spectrums', action: 'embed', id: ':id' })
  end
 
  test "test get request for sets new" do
    assert_routing({ path: '/sets/new/:id', method: 'get' }, {controller: 'sets', action: 'new', id: ':id' })
  end

  test "test post request for match search id" do
    assert_routing({ path: '/match/search/:id', method: 'post' }, {controller: 'match', action: 'search', id: ':id' })
  end
  
   test "test get request for spectrums edit id" do
     assert_routing({ path: '/spectrums/:id/edit', method: 'get' }, {controller: 'spectrums', action: 'edit', id: ':id' })
   end
  
  test "test get request for match id" do
    assert_routing({ path: '/match/:id', method: 'get' }, {controller: 'match', action: 'index', id: ':id' })
  end
  
  test "test get request for match search" do
	  assert_routing({ path: '/match/search', method: 'get' }, {controller: 'match', action: 'index', id: 'search' })
  end
  
  test "test get request for match livesearch" do
    assert_routing({ path: '/match/livesearch', method: 'get' }, {controller: 'match', action: 'livesearch' })
  end

  test "test get request for match get_conditions" do
    assert_routing({ path: '/match/get_conditions', method: 'get' }, {controller: 'match', action: 'index', id: 'get_conditions' })
  end

  test "test post request for spectrums choose" do
    assert_routing({ path: '/spectrums/choose/:id', method: 'post' }, {controller: 'spectrums', action: 'choose', id: ':id' })
  end
  
  test "test post request for sets add" do
    assert_routing({ path: '/sets/add', method: 'post' }, {controller: 'sets', action: 'add'})
  end

  test "test get request for sets show2" do
    assert_routing({ path: '/sets/show2', method: 'get' }, {controller: 'sets', action: 'show', id: 'show2'})
  end

  test "test get request for spectrums plots_rss" do
    assert_routing({ path: '/spectrums/plots_rss', method: 'get' }, {controller: 'spectrums', action: 'show', id: 'plots_rss'})
  end
	
  test "test get request for spectrums show2" do
    assert_routing({ path: '/spectrums/show2', method: 'get' }, {controller: 'spectrums', action: 'show', id: 'show2'})
  end

  test "test get request for spectrums all" do
    assert_routing({ path: '/spectrums/all', method: 'get' }, {controller: 'spectrums', action: 'show', id: 'all'})
  end

  test "test get request for spectrums compare_search" do
    assert_routing({ path: '/spectrums/compare_search', method: 'get' }, {controller: 'spectrums', action: 'show', id: 'compare_search'})
  end
  
  test "test get request for spectrums set_search" do
   assert_routing({ path: '/spectrums/set_search', method: 'get' }, {controller: 'spectrums', action: 'show', id: 'set_search'})
  end

  test "test get request for sets find_match" do
    assert_routing({path: '/sets/find_match', method: 'get'}, {controller: 'sets', action: 'show', id: 'find_match'})
  end

  test "test get request for sets calibrated" do
    assert_routing({ path: '/sets/calibrated', method: 'get' }, {controller: 'sets', action: 'show', id: 'calibrated'})
  end
	
  test "test get request for spectrums anonymous" do
    assert_routing({ path: '/spectrums/anonymous', method: 'get' }, {controller: 'spectrums', action: 'anonymous'})
  end
  
end
