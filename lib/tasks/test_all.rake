desc 'Combined tests task'
task :test_all do |t|
    begin  
      Rake::Task["test"].invoke
    rescue SystemExit => e
      ts = e.status
      next
    ensure
      Rake::Task["jasmine:ci"].invoke
    end
    return ts
end
