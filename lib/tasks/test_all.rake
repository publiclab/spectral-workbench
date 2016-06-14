desc 'Combined tests task'
task :test_all do
  begin  
    Rake::Task["test"].invoke
    Rake::Task["jasmine:ci"].invoke
  end
end
