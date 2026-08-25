Pod::Spec.new do |s|
  s.name           = 'RebootScreenTime'
  s.version        = '0.1.0'
  s.summary        = 'Native iOS authorization bridge for Reboot Screen Time access.'
  s.description    = 'Connects the Expo application to Apple Family Controls authorization.'
  s.license        = { :type => 'MIT' }
  s.author         = 'Reboot'
  s.homepage       = 'https://github.com/ambrymn/rebootapp'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { :git => 'https://github.com/ambrymn/rebootapp.git' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'FamilyControls'
  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
