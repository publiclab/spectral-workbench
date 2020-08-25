# frozen_string_literal: true

desc 'Combined tests task'
task :test_all do
  Rake::Task['test'].invoke
end
