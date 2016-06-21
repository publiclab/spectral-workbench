desc 'Combined tests task'
task :test_all do
  begin  
    Rake::Task["test"].invoke
  end
end
